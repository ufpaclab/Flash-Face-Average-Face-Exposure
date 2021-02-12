function Experiment(jsSheetHandle, jsPsychHandle, codes) {
    jsSheetHandle.CreateSession(RunExperiment);

    function RunExperiment(session) {
        // Define Constants
        const CREDIT_URL = `<CREDIT_URL>&survey_code=${codes.survey_code}`;
        const IMAGE_DURATION = 800;
        const AVERAGE_IMAGE_DURATION = 5000;
        const BLANKING_INTERVAL = 1000;
        const SUBJECT = JSON.parse(SUBJECT_CONFIG)[0];
        const PRACTICE_TRIALS = ["CFD-AF-243-170-N.jpg", "CFD-AF-256-160-N.jpg", "CFD-AM-253-161-N.jpg", "CFD-BF-254-201-N.jpg",
        "CFD-BM-251-013-N.jpg", "CFD-LF-247-051-N.jpg", "CFD-LF-255-088-N.jpg", "CFD-LM-251-073-N.jpg",
        "CFD-WF-252-159-N.jpg", "CFD-WM-257-161-N.jpg", "CFD-AF-255-209-N.jpg", "CFD-AM-247-165-N.jpg",
        "CFD-BF-247-179-N.jpg", "CFD-BM-250-170-N.jpg", "CFD-BM-252-161-N.jpg", "CFD-LF-248-160-N.jpg",
        "CFD-LM-246-087-N.jpg", "CFD-WF-241-210-N.jpg", "CFD-WM-256-138-N.jpg", "CFD-WM-258-125-N.jpg"];

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
                <p>Each pair of faces will appear for less than a second and be followed by a successive pair of faces. After the trial is over, you will be asked to rate the
                degree of distortion seen in the last pair of faces viewed. There are a total of 5 pairs of faces per slider response, each pair appearing three times each.
                After you have submitted your response on the slider, the next trial will start immediately.</p>
                <p>Orient yourself so that you are viewing the screen from 40-50 centimeters away (~2 feet)</p>
            `
        }

        let practiceTrialInstructions = {
            type: 'html-keyboard-response',
            stimulus: `
            <h1>Practice Trials</h1>
            <p>The following 2 trials of the experiment will allow you to get you acquainted with the procedure. Your responses will not be recorded.</p>
            `
        }

        let practiceTrial = {
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
                    },
                }
            ],
            timeline_variables: function() {
                let trialVariables = []
                let faces = PRACTICE_TRIALS;
                for (let i = 0; i < 3; i++) {
                    for (let i = 1; i < faces.length; i += 2) {
                        trialVariables.push(
                            {
                                leftFace: `resources/PracticeTrial/${faces[i - 1]}`,
                                rightFace: `resources/PracticeTrial/${faces[i]}`
                            }
                        );
                    }
                }
                return trialVariables;
            }()
        }

        let instructionsForExposure = {
            type: 'html-keyboard-response',
            stimulus: `
            <h1>Face Exposure</h1>
            <p>You have completed the practice trials. You will now be exposed to faces matching in race and gender in a similiar manner to the practice trials. Your responses will now be recorded.</p>
            <p>Press any key to continue</p>
            `
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

        let instructionsForAverageExposure = {
            type: 'html-keyboard-response',
            stimulus: `
            <h1>Average Face Exposure</h1>
            <p>In these trials, you will be shown the average face based on those used for that trial. The average face will be shown at the start of the trial and you will be given 5
            seconds to observe it in your central vision. A 1 second blank will be inserted afterwords to signal that the trial will now move on to the set of faces to be observed
            in peripheral vision. At the conclusion of the trial, you will be asked to rate the degree of distortion you perceived on the last pair of faces in the trial. Once you
            have submited your answer on the response slider, the next trial will start immediately.</p>
            `
        }

        function createTrial(race, withExposure) {
            return {
                type: 'html-keyboard-response',
                trial_duration: IMAGE_DURATION,
                choices: jsPsychHandle.NO_KEYS,
                timeline: function() {
                    let timelineTrials = [];
                    if (withExposure) {
                        timelineTrials.push({
                            trial_duration: AVERAGE_IMAGE_DURATION,
                            stimulus: function() {
                                let faces = SUBJECT[race].realSet;
                                let averageFaceNameNumbers = '';
                                for (let face of faces) {
                                    averageFaceNameNumbers += `_${face}`
                                }
                                let averageFaceName = `resources/${race}${averageFaceNameNumbers}.png`;
                                return `
                                <div class="flashFaceElement">
                                    <img class="flashFaceElement flashFaceExposure" style="padding-right:15%;" src="${averageFaceName}"/>
                                    <p class="flashFaceElement flashFaceFixation">+</p>
                                    <img class="flashFaceElement flashFaceExposure" style="padding-left:15%;" src="${averageFaceName}"/>
                                </div>`
                            },
                        });
                        timelineTrials.push({
                            trial_duration: BLANKING_INTERVAL,
                            stimulus: `
                            <div class="flashFaceElement">
                                <p class="flashFaceElement flashFaceFixation">+</p>
                            </div>`
                        });
                    }

                    timelineTrials.push({
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
                    });

                    return timelineTrials;
                }()
            }
        }

        function createRun(withExposure) {
            return {
                timeline: function() {
                    let runs = []
                    for (let race in SUBJECT) {
                        runs.push(createTrial(race, withExposure));
                        for (let i = 0; i < 2; i++)
                            runs.push(createTrial(race, withExposure = false));
                        runs.push(measureDistortionTrial);
                    }
                    console.log(runs);
                    return runs;
                }()
            }
        }

        let runWithoutExposure = createRun(withExposure = false);
        let runWithExposure = createRun(withExposure = true);

        let exitFullscreenTrial = {
            type: 'fullscreen',
            fullscreen_mode: false
        }

        let finalTrial = {
            type: 'instructions',
            pages: ['Thank you for participating!'],
            allow_keys: false
        }

        // Configure and Start Experiment
        jsPsychHandle.init({
            timeline: [welcomeTrial, checkVisionTrial, consentFormTrial, instructionsAndEnterFullscreenTrial, 
                practiceTrialInstructions, practiceTrial, measureDistortionTrial, practiceTrial, 
                measureDistortionTrial, instructionsForExposure, runWithoutExposure, instructionsForAverageExposure, 
                runWithExposure, exitFullscreenTrial, finalTrial],
            on_trial_finish: session.insert,
            preload_images: preloadList
            //on_finish: function() { window.top.location.href = CREDIT_URL; }
        });
    }
}
