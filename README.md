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

# deployment

This is now a fully static website that can be served from any static web server or hosting platform.

## Running Locally

Since this is a static website, you can serve it using any static web server:

**Python Simple HTTP Server:**
```bash
python3 -m http.server 8080
```

**Node.js http-server:**
```bash
npx http-server -p 8080
```

**PHP Built-in Server:**
```bash
php -S localhost:8080
```

**VS Code Live Server:**
Install the "Live Server" extension and click "Go Live"

Then open your browser to `http://localhost:8080`

## Deploying to Static Hosts

This site can be deployed to any static hosting service:
- **GitHub Pages**: Push to a gh-pages branch
- **Netlify**: Drag and drop the folder or connect to your git repo
- **Vercel**: Import your git repository
- **AWS S3**: Upload files to an S3 bucket with static hosting enabled
- **Any web server**: Just copy all files to your web root directory

## Regenerating Data

If you modify the PNG files in `assets/data/raw/`, regenerate the data file:

```bash
npm install  # Only needed once to get dependencies for data generation
node generate-data.js
```

This will update `brain-data.json` with the new processed data.