for f in *.svg
do
	sed -i '.bak' 's/${color}/currentColor/g' $f
done
