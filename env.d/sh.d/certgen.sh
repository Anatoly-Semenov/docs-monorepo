#!/usr/bin/env sh

rm ./env.d/secrets.d/*.pem

# 1. Generate CA's private key and self-signed certificate
openssl req \
  -x509 \
  -newkey rsa:4096 \
  -days 365 \
  -nodes \
  -keyout ./env.d/secrets.d/ca-key.pem \
  -out ./env.d/secrets.d/ca-cert.pem \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=Docs/OU=Building/CN=*.localhost"

echo "CA's self-signed certificate"
openssl x509 \
  -in ./env.d/secrets.d/ca-cert.pem \
  -noout \
  -text

# 2. Generate web server's private key and certificate signing request (CSR)
openssl req \
  -newkey rsa:4096 \
  -nodes \
  -keyout ./env.d/secrets.d/server-key.pem \
  -out ./env.d/secrets.d/server-req.pem \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=Docs/OU=Building/CN=*.localhost"

# 3. Use CA's private key to sign web server's CSR and get back the signed certificate
openssl x509 \
  -req \
  -in ./env.d/secrets.d/server-req.pem \
  -days 60 \
  -CA ./env.d/secrets.d/ca-cert.pem \
  -CAkey ./env.d/secrets.d/ca-key.pem \
  -CAcreateserial \
  -out ./env.d/secrets.d/server-cert.pem \
  -extfile ./env.d/secrets.d/server-ext.cnf

echo "Server's signed certificate"
openssl x509 \
  -in ./env.d/secrets.d/server-cert.pem \
  -noout \
  -text
