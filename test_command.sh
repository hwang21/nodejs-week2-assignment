#curl -v http://127.0.0.1:8000/index.js -X GET
curl -v http://127.0.0.1:8000/files/foo.txt -X GET
# test directory
curl -v http://127.0.0.1:8000/foo.txt -X GET
# test app.head function
# curl -v http://127.0.0.1:8000/ -X HEAD will not work since it will wait for the response
curl -v http://127.0.0.1:8000/ --head
curl -v http://127.0.0.1:8000/files/foo.txt --head
curl -v http://127.0.0.1:8000/server.js --head
# test delete
# test delete a file
touch foo.js
cat foo.js
curl -v http://127.0.0.1:8000/foo.js -X DELETE
cat foo.js
# test delete dir
mkdir -p foo/bar
curl -v http://127.0.0.1:8000/foo -X DELETE
ls foo
# test delete subdir
mkdir -p foo/bar
curl -v http://127.0.0.1:8000/foo/bar -X DELETE

# test put
curl -v http://127.0.0.1:8000/foo/bar.js -X PUT
curl -v http://127.0.0.1:8000/foo/test.js -X PUT -d "hello world"
cat foo/test.js 

# test post
curl -v http://127.0.0.1:8000/foo/test.js -X POST -d "hello world2"

