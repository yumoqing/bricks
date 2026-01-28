var bricks = window.bricks || {}

bricks.VideoBox = class extends bricks.JsWidget {
	create(){
		this.dom_element = this._create('video');
		this.set_attribute('autoplay', true);
		this.set_attribute('muted', true);
	}
	get_stream(){
		return this.stream;
	}
	set_stream(stream){
		this.stream = stream
		this.dom_element.srcObject = this.stream;
	}
}

bricks.Signaling = class {
	/*
	{
		signaling_url:
		info:
		connect_opts:
		onclose:
		onlogin:
	}
	*/
	constructor(opts){
		this.signaling_url = opts.signaling_url;
		this.info = opts.info;
		this.connect_opts = opts.connect_opts;
		this.peers = [];
		this.sessions = {};
		this.handlers = {};
		this.sessionhandlers = {};
		this.init_websocket();
		this.hb_task = null;
		this.heartbeat_period = opts.heartbeat_period;
		this.onclose = opts.onclose;
		this.onlogin = opts.onlogin;
		this.onopen = opts.onopen;
		if (!this.heartbeat_period){
			this.heartbeat_period = 0;
		}
	}

	init_websocket(){
		var sessdata = bricks.app.get_session();
		this.socket = new WebSocket(this.signaling_url, sessdata);
		this.socket.onmessage = this.signaling_recvdata.bind(this);
		this.socket.onopen = this.login.bind(this);
		this.socket.onclose = this.reconnect.bind(this);
		this.socket.onerror = this.reconnect.bind(this);
	}
	reconnect(){
		console.log('eror happened');
		if (this.hb_task){
			this.hb_task.cancel();
			this.hb_task = null;
		}
		if (this.onclose){
			this.onclose();
		}
		return;
	}
	del_handler(sessionid){
		var handlers = {};
		delete this.handlers[sessionid];
	}
	async signaling_recvdata(event){
        var datapkg = JSON.parse(event.data);
        var data = datapkg.data;
		console.log('ws recv data=', data);
		if (data.session) {
			var sessionid = data.session.sessionid;
			var sessiontype = data.session.sessiontype;
			var handler = this.handlers[sessionid]
			if (!handler){
				var k = this.sessionhandlers[sessiontype];
				if (!k){
					throw 'recvdata_handler() exception(' + sessiontype + ')';
				}
				var h = new k(this, data.session, this.connect_opts);
				handler = h.recvdata_handler.bind(h);
				this.add_handler(sessionid, handler);
			}
			await handler(data);
		} else {
			await this.recvdata_handler(data);
		}
	}
	add_handler(key, handler){
		this.handlers[key] = handler;
	}
	add_sessionhandler(sessiontype, handler){
		this.sessionhandlers[sessiontype] = handler;
	}
	async recvdata_handler(data){
		console.log('recv data=', data);
		if (data.type == 'online'){
			data.online.forEach(p => {
				var d = this.peers[p.id];
				if (!d) d = {};
				d = bricks.extend(d, p);
				this.peers[p.id] = d;
			});
			if (this.onlogin){
				this.onlogin(data.online);
			}
			return;
		}
		console.log('recv data=', data, 'NOT HANDLED');
	}
	new_session(sessiontype, peer){
		var k = this.sessionhandlers[sessiontype];
		if (!k){
			throw 'new_session() exception(' + sessiontype + ')';
		}
		var sessionid = bricks.uuid();
		var session = {
			sessiontype:sessiontype,
			sessionid:sessionid
		}
		var d = {
			type:'new_session',
			session: session
		};
		this.send_data(d);
		var opts = bricks.extend({}, this.connect_options);
		opts.peer_info = peer;
		var h = new k(this, session, opts);
		this.add_handler(sessionid, h.recvdata_handler.bind(h) );
		return h
	}
	login(){
		console.log('login send', this.heartbeat_period)
		var d = {
			type:'login',
		}
		this.send_data(d);
		if (this.heartbeat_period > 0){
			console.log('call login again in', this.heartbeat_period, ' seconds');
		}
	}

	logout(){
		var d= {
			type:'logout',
		}
		this.send_data(d);
	}
	send_data(d){
		d.msgfrom = this.info;
		var s = JSON.stringify(d);
		console.log('send_data()', s);
		this.socket.send(s);
	}
	socket_send(s){
		this.socket.send(s);
	}
}

bricks.RTCP2PConnect = class {
	/*
	opts:{
		ice_servers:
		peer_info:
		auto_callaccept: true or false
		media_options: { video:trur or false, audio:true or false }
		data_connect: true or false
	}
	*/

	constructor(signaling, session, opts){
		this.id = bricks.uuid();
		this.signaling = signaling;
		this.session = session;
		this.requester = false;
		this.opts = opts;
		this.peers = {};
		this.signal_handlers = {};
		this.local_stream = null;
		this.localVideo = null;
		this.add_handler('sessioncreated', this.h_sessioncreated.bind(this));
		this.add_handler('callrequest', this.h_callrequest.bind(this));
		this.add_handler('callaccepted', this.h_callaccepted.bind(this));
		this.add_handler('offer', this.h_offer.bind(this));
		this.add_handler('answer', this.h_answer.bind(this));
		this.add_handler('icecandidate', this.h_icecandidate.bind(this));
		this.add_handler('sessionquit', this.h_sessionquit.bind(this));
	}

	add_handler(type, f){
		this.signal_handlers[type] = f;
	}
	get_handler(typ){
		return this.signal_handlers[typ];
	}

	async p2pconnect(peer){
		await this.getLocalStream();
		var p = this.peers[peer.id];
		if (!p){
			await this.createPeerConnection(peer);
		} else {
			aconsole.log(peer, 'connect exists', this);
		}
		console.log('p2pconnect() called, this=', this, 'peer=', peer);
	}
	async h_sessioncreated(data){
		await this.p2pconnect(this.opts.peer_info, 'requester');
		if (this.opts.peer_info){
			var d = {
				type:'callrequest',
				msgto:this.opts.peer_info
			}
			this.signaling_send(d);
			this.requester = true;
		}
	}
	async h_callrequest(data){
		if (this.opts.auto_callaccept || true){
			await this.p2pconnect(data.msgfrom, 'responser');
			var d = {
				type:'callaccepted',
				msgto:data.msgfrom
			};
			this.signaling_send(d);
			return;
		}
	}
	async h_callaccepted(data){
		this.createDataChannel(data.msgfrom);
		await this.send_offer(data.msgfrom, true);
	}
	async h_offer(data){
		console.log('h_offer(), this=', this, 'peer=', data.msgfrom);
		var pc = this.peers[data.msgfrom.id].pc;
		var offer = new RTCSessionDescription(data.offer);
		await pc.setRemoteDescription(offer);
		var answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		this.signaling_send({
			type:'answer',
			answer:pc.localDescription,
			msgto:data.msgfrom
		});
		if (this.peers[data.msgfrom.id].role != 'requester'){
			await this.send_offer(data.msgfrom);
		}
		
	}
	async h_answer(data){
		var desc = new RTCSessionDescription(data.answer);
		var pc = this.peers[data.msgfrom.id].pc;
		await pc.setRemoteDescription(desc);
	}
	async h_icecandidate(data){
		var candidate = new RTCIceCandidate(data.candidate);
		var pc = this.peers[data.msgfrom.id].pc;
		await pc.addIceCandidate(candidate);
	}
	async h_sessionquit(data){
		var pc = this.peers[data.msgfrom.id].pc;
		pc.close();
	}
	async send_offer(peer, initial){
		console.log('send_offer(), peers=', this.peers, 'peer=', peer);
		var pc = this.peers[peer.id].pc;
		if (initial){
			this.peers[peer.id].role = 'requester';
		} else {
			this.peers[peer.id].role = 'responser';
		}
        var offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        var d = {
            type:'offer',
            offer:pc.localDescription,
            msgto:peer
        };
		this.signaling_send(d);
	}
	
	send_candidate(peer, event){
		console.log('send_candidate called, peer=', peer, 'event=', event); 
        if (event.candidate) {
            var candidate = event.candidate;
            this.signaling_send({ 
                type: 'icecandidate', 
                msgto:peer,
                candidate: candidate
            }); 
        }
	}

	signaling_send(d){
		d.session = this.session;
		this.signaling.send_data(d);
	}

	async recvdata_handler(data){
		console.log('recvdata=', data, this.signal_handlers);
		var f = this.get_handler(data.type);
		if (f) {
			await f(data);
			return;
		}
		console.log('recvdata=', data, 'NOT HANDLED');
	}

	async ice_statechange(peer, event){
		var pc = this.peers[peer.id].pc;
		console.log(`oniceconnectionstatechange, pc.iceConnectionState is ${pc.iceConnectionState}.`);
	}

	async connection_statechange(peer, event){
		var pc = this.peers[peer.id].pc;
		console.log(`${peer.id} state changed. new state=${pc.connectionState}`);
		console.log('state=', pc.connectionState, typeof(pc.connectionState));
		if (pc.connectionState == 'disconnected'){
			this.peer_close(peer);
			if (this.opts.on_pc_disconnected){
				this.opts.on_pc_disconnected(peer);
			}
            return;
        }
        if (pc.connectionState == 'connected'){
			console.log('state is connected, data_connect=',
						this.opts.data_connect);
			if(this.opts.on_pc_connected){
				this.opts.on_pc_connected(peer);
			}
        }
	}

	async dc_accepted(peer, event){
		console.log('accept datachannel ....');
		this.peers[peer.id].dc = event.channel;
		await this.dc_created(peer, this.peers[peer.id].dc);
	}
	async dc_created(peer, dc){
		console.log('dc_created.....', dc);
		dc.onmessage = this.datachannel_message.bind(peer);
		dc.onopen = this.datachannel_open(peer);
		dc.onclose = this.datachannel_close(peer);
	}

	async datachannel_message(peer, event){
		console.log('datachannel_message():', this, arguments);
		var dc = this.peers[peer.id].dc;
		if (this.opts.on_dc_messaage){
			await this.opts.on_dc_message(dc, event.data);
		}
	}
	async datachannel_open(peer){
		console.log('datachannel_open():', this, arguments);
		var dc = this.peers[peer.id].dc
		if (this.opts.on_dc_open){
			await this.opts.on_dc_open(dc);
		}
	}
	async datachannel_close(peer){
		console.log('datachannel_close():', this, arguments);
		var dc = this.peers[peer.id].dc
		if (this.opts.on_dc_close){
			await this.opts.on_dc_close(dc);
		}
	}
	async createDataChannel(peer){
		var pc = this.peers[peer.id].pc;
		this.peers[peer.id].dc = pc.createDataChannel('chat', {ordered:true});
		var dc = this.peers[peer.id].dc;
		await this.dc_created(peer, this.peers[peer.id].dc);
		console.log('dc created', this.peers[peer.id].dc);
	}
	async createPeerConnection(peer){
		const configuration = {
			iceServers:this.opts.ice_servers
		}
		console.log('RTCPC configuration=', configuration);
		var pc = new RTCPeerConnection(configuration);
		if (this.local_stream){
			this.local_stream.getTracks()
			.forEach(track => {
				pc.addTrack(track, this.local_stream);
			});
		}
		this.peers[peer.id] = bricks.extend({}, peer);
		this.peers[peer.id].pc = pc;
		this.peers[peer.id].role = '';
		var remoteVideo = new bricks.VideoBox();
		this.peers[peer.id].video = remoteVideo;
        pc.onicecandidate = this.send_candidate.bind(this, peer);
        pc.oniceconnectionstatechange = this.ice_statechange.bind(this, peer);
        pc.onconnectionstatechange = this.connection_statechange.bind(this, peer);
		pc.ondatachanel = this.dc_accepted.bind(this, peer);
		pc.ontrack = event => {
			remoteVideo.set_stream(event.streams[0]);
		}
	}
	async changeLocalVideoStream(peer, new_stream){
		var pc = this.peers[peer.id].pc;
	    const senders = pc.getSenders();
		const oldVideoTrackSender = senders.find(sender => sender.track && sender.track.kind === 'video');
		if (oldVideoTrackSender) {
			pc.removeTrack(oldVideoTrackSender);
		}
		new_stream.getTracks().forEach(track => {
			if (track.kind === 'video') {
				pc.addTrack(track, newStream);
			}
		});
		await this.send_offer(peer, true);
	}
	async getLocalStream() {
		if (this.opts.media_options){
			try {
				var mediaOptions = this.opts.media_options;
				this.local_stream = await navigator.mediaDevices.getUserMedia(mediaOptions);
				this.localVideo = new bricks.VideoBox();
				this.localVideo.set_stream(this.local_stream);
			} catch (error) {
				console.error('获取本地媒体流失败：', error);
			}
			try {
				this.local_screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
			} catch (error) {
				console.error('获取本地Screen失败：', error);
			}
		}
	}
	peer_close(peer){
		var pc = this.peers[peer.id].pc;
		var video = this.peers[peer.id].video;
		pc.getReceivers().forEach(receiver => {
			if (receiver.track){
				receiver.track.stop();
			}
		});
		pc.getSenders().forEach(receiver => {
			if (receiver.track){
				receiver.track.stop();
			}
		});
		video.get_stream().getTracks().forEach(track => track.stop());
		var dc = this.peers[peer.id].dc;
		if (dc){
			dc.close();
		}
		pc.close();
		delete this.peers[peer.id];
		var keys = Object.keys(this.peers);
		if (keys.length == 0){
			this.localVideo.get_stream()
			.getTracks().forEach(track => track.stop());
			this.local_stream.getTracks().forEach(track => track.stop());
			this.local_screan.getTracks().forEach(track => track.stop());
			this.signaling.del_handler(this.session.sessionid);
		}
	}
};

