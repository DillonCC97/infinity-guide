cursor = db.businesses.find();
while(cursor.hasNext()){
    printjson(cursor.next());
}