function Experiment(jsSheetHandle, jsPsychHandle, codes) {
    jsSheetHandle.CreateSession(RunExperiment);

    function RunExperiment(session) {
        // Define Constants
        const CREDIT_URL = `<CREDIT_URL>&survey_code=${codes.survey_code}`;

        // Define Experiment Trials
        let welcomeTrial = {
            type: 'html-keyboard-response',
            stimulus:`
                <p>Welcome to the experiment.</p>
                <p>Press any key to begin.</p>
            `
        };

        let checkVisionTrial = {
            type: 'survey-multi-choice',
            questions: [{
                name: 'vision',
                prompt: 'Do you have normal or correct-to-normal vision?',
                options: ['Normal', 'Corrected-to-Normal', 'Other'],
                required: true
            }]
        };

        let consentFormTrial = {
            type: 'external-html',
            url: 'https://ufpaclab.github.io/Consent-Forms/Active/Consent.html',
            cont_btn: 'consent-button'
        }

        let instructionsAndEnterFullscreenTrial = {
            type: 'fullscreen',
            message: `
                <h1>Instructions</h1>
                <p>Stare at the fixation cross and use your peripheral vision to observe the faces on the left and right.</p>
                <p>Orient yourself so that you are viewing the screen from 40-50 centimeters away (~2 feet)</p>
            `
        }

        let presenceOfIllusionTrial = {
            type: 'html-keyboard-response',
            trial_duration: IMAGE_DURATION,
            choices: jsPsychHandle.NO_KEYS,
            timeline: [
                {  
                    stimulus: function() {
                        return `
                        <div class="flashFaceElement">
                            <img class="flashFaceElement flashFaceImage" src="${jsPsychHandle.timelineVariable('leftFace', true)}"/>
                            <p class="flashFaceElement flashFaceFixation">+</p>
                            <img class="flashFaceElement flashFaceImage" src="${jsPsychHandle.timelineVariable('rightFace', true)}"/>
                        </div>`;
                    }
                }
            ],
            timeline_variables: function() {
                var faces = ImageNamesToImages(faceNames);
                var trialVariables = [];
                for(var i = 0; i < faces.length; i+=2) {
                    trialVariables.push({
                        leftFace: faces[i],
                        rightFace: faces[i+1]
                    });
                }
                return [].concat(trialVariables, trialVariables, trialVariables);
            }()
        }

        let measureDistortionTrial = {
            type: 'html-slider-response',
            start: 1,
            min: 1,
            max: 7,
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            button_label: 'Submit',
            stimulus: `
                <p>Rate the amount of distortion seen on the last set of faces</p>
            `
        }

        let experimentTrial = {
            type: 'html-keyboard-response',
            trial_duration: IMAGE_DURATION,
            choices: jsPsychHandle.NO_KEYS,
            timeline: [
                {  
                    stimulus: function() {
                        return `
                        <div class="flashFaceElement">
                            <img class="flashFaceElement flashFaceImage" src="${jsPsychHandle.timelineVariable('leftFace', true)}"/>
                            <p class="flashFaceElement flashFaceFixation">+</p>
                            <img class="flashFaceElement flashFaceImage" src="${jsPsychHandle.timelineVariable('rightFace', true)}"/>
                        </div>`;
                    }
                }
            ],
            timeline_variables: function() {
                const facesRequired = TRIALS_1*2;
                var faceNames = jsPsychHandle.randomization.sampleWithoutReplacement(FACE_NAMES, facesRequired);

                var faces = ImageNamesToImages(faceNames);
                var trialVariables = [];
                for(var i = 0; i < faces.length; i+=2) {
                    trialVariables.push({
                        leftFace: faces[i],
                        rightFace: faces[i+1]
                    });
                }
                return trialVariables;
            }()
        }

        let exitFullscreenTrial = {
            type: 'fullscreen',
            fullscreen_mode: false
        }

        let finalTrial = {
            type: 'instructions',
            pages: ['Thanks for particpating! Please email us at fake@emial.com.'],
            allow_keys: false
        }

        // Configure and Start Experiment
        jsPsychHandle.init({
            timeline: [welcomeTrial, checkVisionTrial, consentFormTrial, instructionsAndEnterFullscreenTrial, presenceOfIllusionTrial, measureDistortionTrial, experimentTrial, exitFullscreenTrial, measureDistortionTrial, finalTrial],
            on_trial_finish: session.insert,
            on_finish: function() { window.top.location.href = CREDIT_URL; }
        });
    }
}
