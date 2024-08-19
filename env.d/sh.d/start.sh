#!/bin/bash

echo "название проекта"
read -r projectName

cp env.d/dotenv.d/template.app.env app.env
cp env.d/dotenv.d/platform.env .env
cp env.d/ci.d/template.gitlab-ci.yml gitlab-ci.yml

sed -i "s/nest-template/$projectName/g" gitlab-ci.yml
sed -i "s/nest-template/$projectName/g" .env
sed -i "s/nest-template/$projectName/g" env.d/charts.d/Chart.yaml
sed -i "s/nest-template/$projectName/g" env.d/charts.d/prod.values.yaml
sed -i "s/nest-template/$projectName/g" env.d/charts.d/test.values.yaml
sed -i "s/nest-template/$projectName/g" package.json
sed -i "s/nest-template/$projectName/g" sonar-project.properties
sed -i "s/nest-template/$projectName/g" Makefile

echo "выберите модули, которые будут присутствовать"
#echo "http - y/n"
#read isHttpModule

echo "grps - y/n"
read -r isGrps

node env.d/scripts.d/change-file.mjs --file env.d/charts.d/prod.values.yaml --param $isGrps
node env.d/scripts.d/change-file.mjs --file env.d/charts.d/test.values.yaml --param $isGrps