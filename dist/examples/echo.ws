# ws_data 客户端传过来的数据
# ws_pool 保存所有链接
#    register(id)
#       注册自己，id必须唯一
#    sendto(data, id=None)
#       发送消息给客户端，当id为空时，发送给当前链接的客户端，否则发送给id指定的客户端
#    is_online(id)
#       检查id指定的客户端是否在线
# user = await get_user()
userid = 'kkkkk'
ws_pool.register(userid)
resp = 'resp=' + ws_data
if ws_pool.is_online(userid):
	print(f'{userid=} is online')
	ret = {
		'efew':1,
		'g':3
	}
	r = await ws_pool.sendto(ret, userid)
	print(f'{ret=} send return {r}')
else:
	print(f'{userid=} is not online')

print(f'{resp=}, {ws_pool.get_data()=}')
await ws_pool.sendto(resp)
# if ws_pool.is_online('bington'):
#	await ws_pool.sendto(resp, 'bington')
