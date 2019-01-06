# How to draw brain images

The raw brain images brain_lateral and brain_medial get used to generate the visuals for the Brain simulation. 

The processing scripts will find anything encoded in the green channel 0->255 and process it with the following rules. Whenever the code finds a red channel value it will ignore that pixel entirely.

# What to update in code

data.js - knows about how to read the png files
areas.js - interprets the properties

# Neuron properties

x - x location of the neurons receptive field [0,255]=[-25,25 degs]
y - y location of the neurons receptive field [0,255]=[-25,25 degs]
sd - standard deviation of the receptive field, this will act as a weight on the firing rate [0,255] = [1 15 degs]

# Input structure

The files are organized into folders by brain area as .png files. Each neuron is a pixel.

# Loading

The brain.js (node.js server) just loads the png files directly and parses them. See data.js