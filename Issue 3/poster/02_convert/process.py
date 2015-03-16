#!/usr/bin/env python
# -*- coding: utf-8 -*-


from subprocess import call
import glob
import os
import shlex



print "start"


root = './../DATA/generator/'

for i in range(100):
	cFolder = root + str(i+1) + "/"

	print "Start: " + str(i+1)

	# temp = "/Applications/Inkscape.app/Contents/MacOS/Inkscape --export-area-drawing --export-eps=" + cFolder + "export.eps " + cFolder + "export.svg"
	temp = "/Applications/Inkscape.app/Contents/Resources/script --export-area-drawing --export-eps=\"" + os.path.abspath(cFolder) + "/export.eps\" \"" + os.path.abspath(cFolder) + "/export.svg\""
	# print temp
	call(shlex.split(temp) )


	temp = "convert -threshold 45% \"" + os.path.abspath(cFolder) + "/original.jpg\" -compress lzw \"" + os.path.abspath(cFolder) + "/original.tif\""
	# print temp
	call(shlex.split(temp) )

	print "End: " + str(i+1)
