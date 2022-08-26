@echo off
ionic build
ionic cap copy android
ionic cap sync android
ionic cap open android