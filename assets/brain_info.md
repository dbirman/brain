# How to draw brain images

The raw brain images brain_lateral and brain_medial get used to generate the visuals for the Brain simulation. 

The processing scripts will find anything encoded in the green channel 0->255 and process it with the following rules. Whenever the code finds a red channel value it will ignore that pixel entirely.

# Neuron properties

px - pixel x location
py - pixel y location
x - x location of the neurons receptive field [0,255]=[-25,25 degs]
y - y location of the neurons receptive field [0,255]=[-30,30 degs]
sd - standard deviation of the receptive field, this will act as a weight on the firing rate [0,255] = [1 15 degs]

# Input structure

The files are organized into folders by brain area as .png files. Each neuron is a pixel.

# Output structure

The output files are two binary files that list in order the coordinates and properties of each neuron for the lateral surface and the medial surface. To save space the data are each one continuous array. When the server spins up it clears out the mongodb database and loads the binary data there. 