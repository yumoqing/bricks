sources=$(find bricks -name "*.js" -exec grep -l '.register(' {} \; -print|sort -u)
for s in $sources
do
	t2t -p prompt.md -o docs/ai $s
done
