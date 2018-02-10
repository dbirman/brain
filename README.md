# brain

*Making cognitive neuroscience playful*

Brain is a private project to develop an educational platform to help students engage with cognitive neuroscience in a playful manner. Students in introduction to cognitive neuroscience (Psych 50, taught by Justin Gardner at Stanford) often have difficulty grasping basic physiology, anatomy, and mechanistic concepts. For example, by the final some students continue to mix up anatomical terms (e.g. where is occipital cortex), misunderstand scaling (e.g. fMRI gives us millisecond access to brain activity), and have a poor grasp of the overall structure of the human brain. One reason for this failure in teaching might be that students are being introduced to these ideas in a non-intuitive manner. Brain is an attempt to approach this last challenge: how do we make cognitive neuroscience more intuitive, more of a process of discovery than memorization, and more effectively achieve the learning goals of instructors.

# goals

* Provide a unified visual/spatial framework for students to engage with a brain simulation
* Interactive / responsive tools to observe sensory input, motor output, internal feedback, and signal broadcast in the brain
* Experimental tools to test adding and removing signals
* Integrated quizzes that track student knowledge as they interact with different aspects of Brain
* Integrated tutorials that create linear tracks through the Brain to help students discover specific conceptual principles

# vision

I see Brain as a pilot project to obtain funding to launch an educational startup focused on creating interactive playful simulations. My goals and timeline are as follows:
 * Winter 2018: pilot simulation ideas in Psych 50
 * Spring 2018: Re-work Brain focusing on minimalist design principles and intuitive aesthetics, create a single example "tutorial track"
 * Summer 2018: Present Brain to Eagleman and possibly VCs to attempt to pull funding to build a 3D version of the tool
 * Fall 2018: Present Brain at SFN
 * Winter 2019: Pilot Brain in Psych 50 -- present at other universities
 ...

# brain.js

Brain.js is the initial version of the tool. These are the goals for a v1.0, aimed at being deployed in Psych 50 for Winter quarter 2018-2019.

* Brainviewer: A 2D visualization tool centered around a flattened surface model of the human brain. The viewer should be intuitive and transition between zoomed-out and zoomed-in views naturally. 
* Visual Field and "Guess Mode": A stimulus tool that displays various stimuli onto the brain's "visual field" with a variant where the stimulus is hidden and the viewer has to guess what is being shown 
* Recorder: Electrodes that can be placed into the brainviewer to record 
* Tutorials: Transitioning the Psych 50 tutorials from stand-alone HTML pages to a format based on JGL that is directly integrated in Brain.