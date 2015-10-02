#!/bin/bash
ionic build android && adb install -r platforms/android/ant-build/MainActivity-debug.apk
