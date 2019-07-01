# Project 2

Web Programming with Python and JavaScript





















//FOR VOICE AND VIDEO CHAT (NOT IN THIS BUILD)
Create certificate by executing this in the home directory:
(for unix systems)
openssl req -x509 -out localhost.crt -keyout localhost.key -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -extensions EXT -config <(printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

Windows
openssl req -x509 -nodes -days 730 -newkey rsa:2048 -keyout cert.key -out cert.pem -config req.cnf -sha256



add certificate via
certutil -addstore -enterprise -f "Root" cert.pem

chrome://flags/#allow-insecure-localhost
^ Restart chrome after doing so