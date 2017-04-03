# brain

Brain is a private project to develop an educational platform to help students learn about cognitive neuroscience. Students in introduction to cognitive neuroscience (Psych 50, taught by Justin Gardner at Stanford) often have difficulty grasping basic physiology, anatomy, and mechanistic concepts. For example, by the final some students continue to mix up anatomical terms (e.g. where is occipital cortex), misunderstand scaling (e.g. fMRI gives us millisecond access to brain activity), and have a poor grasp of the overall structure of the human brain. One reason for this failure in teaching might be that students are being introduced to these ideas in a non-intuitive manner. Brain is an attempt to approach this last challenge: how do we make cognitive neuroscience more intuitive, more of a process of discovery than memorization, and more effectively achieve the learning goals of instructors.

# goals

* Provide a unified visual/spatial framework for students to engage with key concepts from cognitive neuroscience
* Interactive / responsive tools to observe sensory input, motor output, internal feedback, and signal broadcast in the brain
* Data simulation and experimental tools to experiment with adding and removing signals
* Cross-species tools to help visualize how human, macaque, and mouse brains are homologous
* Continuous tracking of interactions to quantify whether students are improving over time
* Integrated quizzes that track student knowledge as they interact with different aspects of Brain
* Integrated tutorials that create linear tracks through Brain to help students discover specific conceptual principles

# brain.js

Brain.js is the initial version of the tool. These are the goals for v1.0, aimed at being deployed in Psych 50 for Winter quarter 2017-2018.

* Brainviewer: A visualization tool centered around a surface model of the human brain. The idea is that the tool can smoothly transition between slice data, surface data, flat maps, and electrode recordings in an intuitive manner.
* Sensorimotor systems: A suite of tools that let you display the results of sensory input and show the results of stimulation on motor output.
* Tutorials: Transitioning the Psych 50 tutorials from stand-alone HTML pages to a format based on JGL that is directly integrated in Brain.
* Quizzes: Creating a new quiz tool based around the JGL survey format. Ideally integrated with the Canvas API so that quiz results are automatically uploaded there. 

# changelist

v0

 - Readme file updated with overview, goals, and structure
