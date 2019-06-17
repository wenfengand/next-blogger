#!/bin/bash
#########################################################################
# File Name: run.sh
# Author: wenfeng
# mail: wenfengand@126.com
# Created Time: 2019-06-14 19:24:45
#########################################################################
DIR1="`dirname $BASH_SOURCE`"
MYDIR=`readlink -f "$DIR1"`
docker run --rm \
    -v $MYDIR:/workspace \
    -p 9548:8008 \
    -it wenfengand/nodejs:v10.16 /bin/bash 
