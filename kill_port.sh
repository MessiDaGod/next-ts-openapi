#!/bin/sh
lsof -n -i4TCP:3000| grep LISTEN | awk '{ print $2 }' | xargs kill -9