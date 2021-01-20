function Experiment(jsSheetHandle, jsPsychHandle, codes) {
    jsSheetHandle.CreateSession(RunExperiment);

    function RunExperiment(session) {
        // Define Constants
        const CREDIT_URL = `<CREDIT_URL>&survey_code=${codes.survey_code}`;
        const IMAGE_DURATION = 800
        const SUBJECT = JSON.parse(SUBJECT_CONFIG)[0];

        let preloadList = [];
        for (let race in SUBJECT) {
            let faces = SUBJECT[race].realSet
            let averageFaceNameNumbers = '';
            for (let face of faces) {
                averageFaceNameNumbers += `_${face}`
            }
            preloadList.push(`resources/${race}${averageFaceNameNumbers}.png`)

            for (let testFace of SUBJECT[race].testSet) {
                preloadList.push(`resources/${race}/${race}_${testFace}.jpg`)
            }

            for (let realFace of SUBJECT[race].realSet) {
                preloadList.push(`resources/${race}/${race}_${realFace}.jpg`)
            }
        }
        console.log(preloadList)
        

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

        let runWithoutExposure = {
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
                        </div>`
                    }
                }
            ],
            timeline_variables: function() {
                let trialVariables = []
                for (let race in SUBJECT) {
                    let faces = SUBJECT[race].testSet
                    for (let i = 1; i < faces.length; i += 2) {
                        trialVariables.push(
                            {
                                leftFace: `resources/${race}/${race}_${faces[i - 1]}.jpg`,
                                rightFace: `resources/${race}/${race}_${faces[i]}.jpg`
                            }
                        );
                    }
                }
                return trialVariables;
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

        let createTrialWithExposure = function(race) {
            return {
                type: 'html-keyboard-response',
                trial_duration: IMAGE_DURATION,
                choices: jsPsychHandle.NO_KEYS,
                timeline: [
                    {
                        stimulus: function() {
                            let faces = SUBJECT[race].realSet;
                            let averageFaceNameNumbers = '';
                            for (let face of faces) {
                                averageFaceNameNumbers += `_${face}`
                            }
                            let averageFaceName = `resources/${race}${averageFaceNameNumbers}.png`;
                            return `
                            <div class="flashFaceElement">
                                <img class="flashFaceElement flashFaceImage" src="${averageFaceName}"/>
                                <p class="flashFaceElement flashFaceFixation">+</p>
                                <img class="flashFaceElement flashFaceImage" src="${averageFaceName}"/>
                            </div>`
                        },
                    },
                    {
                        timeline: [
                            {
                                stimulus: function() {
                                    return `
                                    <div class="flashFaceElement">
                                        <img class="flashFaceElement flashFaceImage" src="${jsPsychHandle.timelineVariable('leftFace', true)}"/>
                                        <p class="flashFaceElement flashFaceFixation">+</p>
                                        <img class="flashFaceElement flashFaceImage" src="${jsPsychHandle.timelineVariable('rightFace', true)}"/>
                                    </div>`
                                }
                            }
                        ],
                        timeline_variables: function() {
                            let trialVariables = []
                            let faces = SUBJECT[race].realSet
                            for (let i = 1; i < faces.length; i += 2) {
                                trialVariables.push(
                                    {
                                        leftFace: `resources/${race}/${race}_${faces[i - 1]}.jpg`,
                                        rightFace: `resources/${race}/${race}_${faces[i]}.jpg`
                                    }
                                );
                            }
                            return trialVariables;
                        }()
                    }
                ]
            }
        }

        let runWithExposure = {
            timeline: function() {
                let runs = []
                for (let race in SUBJECT) {
                    runs.push(createTrialWithExposure(race));
                }
                return runs;
            }()
        }

        let exitFullscreenTrial = {
            type: 'fullscreen',
            fullscreen_mode: false
        }

        let finalTrial = {
            type: 'instructions',
            pages: ['Thank you for participating! Please click the right arrow key to receive credit.'],
            allow_keys: false
        }

        // Configure and Start Experiment
        jsPsychHandle.init({
            timeline: [welcomeTrial, checkVisionTrial, consentFormTrial, instructionsAndEnterFullscreenTrial, runWithoutExposure, measureDistortionTrial, runWithExposure, measureDistortionTrial, exitFullscreenTrial, finalTrial],
            on_trial_finish: session.insert,
            preload_images: preloadList
            //on_finish: function() { window.top.location.href = CREDIT_URL; }
        });
    }
}
