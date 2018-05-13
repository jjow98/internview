for i in a b c d e f g h i j k l m n o p q r s t u v w x y z
do
  for j in a b c d e f g h i j k l m n o p q r s t u v w x y z
  do
    ./npq $i$j >x.out$i$j
  done
done

for i in x.out??
do
  if wc $i | grep -s -q ' 200  '
  then
    ./big $id
  fi
done

sort -u x.out* |
awk '$NF ~ /^20(18|19|20|21)$/ {if(NF>4){print $1,$3,$4,$5}else{print $1,$2,$3,$4}}' > allNames
rm x.out*
exit