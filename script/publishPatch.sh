#!/usr/bin/env bash

while true; do
    read -p "Do you want to publish a patch? [y/n]: " yn
    case $yn in
        [Yy]* ) gulp test; npm version patch; git push; npm publish .;break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done
