#!/bin/sh
lsof -n -i4TCP:3000| grep LISTEN | awk '{ print $2 }' | xargs kill -9
lsof -n -i4TCP:8080| grep LISTEN | awk '{ print $2 }' | xargs kill -9