function Experiment(jsSheetHandle, jsPsychHandle, codes) {
    jsSheetHandle.CreateSession(RunExperiment);

    function RunExperiment(session) {
        // Define Constants
        const CREDIT_URL = `https://app.prolific.com/submissions/complete`;
        const IMAGE_DURATION = 800;
        const AVERAGE_IMAGE_DURATION = 5000;
        const BLANKING_INTERVAL = 1000;
        const SUBJECT = SUBJECT_CONFIG[session.subject_number];
        const PRACTICE_TRIALS = ["CFD-AF-243-170-N.jpg", "CFD-AF-256-160-N.jpg", "CFD-AM-253-161-N.jpg", "CFD-BF-254-201-N.jpg",
        "CFD-BM-251-013-N.jpg", "CFD-LF-247-051-N.jpg", "CFD-LF-255-088-N.jpg", "CFD-LM-251-073-N.jpg",
        "CFD-WF-252-159-N.jpg", "CFD-WM-257-161-N.jpg", "CFD-AF-255-209-N.jpg", "CFD-AM-247-165-N.jpg",
        "CFD-BF-247-179-N.jpg", "CFD-BM-250-170-N.jpg", "CFD-BM-252-161-N.jpg", "CFD-LF-248-160-N.jpg",
        "CFD-LM-246-087-N.jpg", "CFD-WF-241-210-N.jpg", "CFD-WM-256-138-N.jpg", "CFD-WM-258-125-N.jpg"];

        // Define Experiment Trials
        let preload = {
            type: 'preload',
            images: function() {
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
                for (let practiceFace of PRACTICE_TRIALS) {
                    preloadList.push(`resources/PracticeTrial/${practiceFace}`)
                }
                preloadList.push('resources/arm.png');
                return preloadList
            }(),
            message: `We're almost ready! Please be patient as your experiment loads.`,
            show_detailed_errors: true
        }

        let enterFullscreen = {
            type: 'fullscreen'
        }

        let welcomeTrial = {
            type: 'html-keyboard-response',
            stimulus:`
                <p>Welcome to the experiment.</p>
                <p>Press any key to continue</p>
            `
        };

        let getAge = {
            type: 'survey-text',
            questions: [{
                name: 'age',
                prompt: 'What is your age?',
                required: true,
                columns: 3
            }]
        }

        let getSex = {
            type: 'survey-multi-choice',
            questions: [
                {
                    name: 'sex',
                    prompt: 'What is your sex assigned at birth?',
                    options: ['Male', 'Female', 'Intersex'],
                    required: true
                },
                {
                    name: 'gender',
                    prompt: 'What is your gender?',
                    options: ['Cis Woman', 'Cis Man', 'Trans Woman', 'Trans Man', 'Non-Binary'],
                    required: true
                }
            ]
        }

        let checkVisionTrial = {
            type: 'survey-multi-choice',
            questions: [{
                name: 'vision',
                prompt: 'Do you have normal or correct-to-normal vision?',
                options: ['Normal', 'Corrected-to-Normal (i.e., wear glasses or contacts)', 'Other'],
                required: true
            }]
        };

        let grabACreditCard = {
            type: 'html-keyboard-response',
            stimulus:`
                First, grab a credit card sized object! You'll need it in a second for scale. Keep it close by, so you won't have to move to grab it.
            `
        };

        let armsLengthInstruction = {
            type: "image-keyboard-response",
            stimulus: "resources/arm.png",
            prompt: `<p>This experiment consists of three parts, with each part having multiple trials.</p>
            <p>Throughout the entirety of the experiment, please sit at an arm's distance from your computer screen, as illustrated above.</p>
            <p>Your attention should also be focused on the center of your screen.</p>
            <p>Press any key to continue</p>`
        };

        let cameraInit = {
            type: 'webgazer-init-camera',
            instructions: `<p>The <b>ONLY</b> webcam data collected is the point on the screen you are looking at. No images or recordings will ever leave your computer.</p>
            <p>Position your head so that the webcam has a good view of your eyes.</p>
            <p>Use the video in the upper-left corner as a guide. Center your face in the box and look directly towards the camera.</p>
            <p>It is important that you try and keep your head reasonably still throughout the experiment, so please take a moment to adjust your setup as needed.</p>
            <p>When your face is centered in the box and the box turns green, you can click to continue.</p>`
        };

        let chinrest = {
            type: "virtual-chinrest",
            blindspot_reps: 3,
            resize_units: "none",
            pixels_per_unit: 50,
        };

        let cameraCalibrateInstructions = {
            type: 'html-keyboard-response',
            stimulus:`
                <p>The following event will calibrate our eyetracking. Please focus on dots as they appear, and then left-click each one with your mouse.</p>
                <p>Press any key to begin.</p>
            `
        }

        let cameraCalibrate = {
            type: 'webgazer-calibrate',
            calibration_points: [[25,50], [50,50], [75,50], [50,25], [50,75]],
            calibration_mode: 'click'
        }

        let cameraValidationInstructions = {
            type: 'html-keyboard-response',
            stimulus:`
                <p>The following event will test the accuracy of our eye tracking. Please focus on the black dots as they appear.</p>
                <p>Press any key to begin.</p>
            `
        }

        let cameraValidation = {
            type: 'webgazer-validate',
            validation_points: [[-200,-200], [-200,200], [200,-200], [200,200]],
            validation_point_coordinates: 'center-offset-pixels',
            show_validation_data: true
          }

        let generalInstructions = {
            type: 'html-keyboard-response',
            stimulus: `
            <h1>Instructions</h1>
            <p>In each trial in this experiment, you will stare at the central fixation cross at all times and use your peripheral vision to observe faces on the left and right side of the screen</p>
            <p>Each pair of faces will appear for less than a second and be followed by a successive pair of faces. After the trial is over, you will be asked to rate the
            degree of distortion seen in the last pair of faces viewed. There are a total of 5 pairs of faces per slider response, each pair appearing three times each.
            After you have submitted your response on the slider, the next trial will start immediately.</p>
            <p>Press any key to continue</p>
        `
        }

        let practiceTrialInstructions = {
            type: 'html-keyboard-response',
            stimulus: `
            <h1>Practice Trials</h1>
            <p>The following phase of the experiment will allow you to get you acquainted with the procedure. Your responses will not be recorded.</p>
            <p>Press any key to continue</p>
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
                    let OnlyDoHalfOfTheFaces = faces.length / 2;
                    for (let i = 1; i < OnlyDoHalfOfTheFaces; i += 2) {
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
            <p>You have completed the practice trials. You will now be exposed to faces in a similiar manner to the practice trials. Your responses will now be recorded.</p>
            <p>Press any key to continue</p>
            `
        }

        let measureDistortionTrial = {
            type: 'html-slider-response',
            slider_start: function() {return Math.floor(Math.random() * 7) + 1},
            min: 1,
            max: 7,
            labels: ['Little or No Distortion', '', '', '', '', '', 'Very Strong Distortion'],
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
            seconds to observe it in your peripheral vision. A 1 second blank will be inserted afterwords to signal that the trial will now move on to the set of faces to be observed
            in peripheral vision. At the conclusion of the trial, you will be asked to rate the degree of distortion you perceived on the last pair of faces in the trial. Once you
            have submited your answer on the response slider, the next trial will start immediately.</p>
            <p>Press any key to continue</p>
            `
        }

        function createTrial(race, withExposure) {
            return {
                type: 'html-keyboard-response',
                trial_duration: IMAGE_DURATION,
                choices: jsPsychHandle.NO_KEYS,
                extensions: [
                    {
                        type: 'webgazer',
                        params: {
                            targets: ['.flashFaceFixation']
                        }
                    }
                ],
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
                            runs.push(createTrial(race, false));
                        runs.push(measureDistortionTrial);
                    }
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

        // Configure and Start Experiment
        jsPsychHandle.init({
            timeline: function() {
                let sessionTimeline = [];
                sessionTimeline = sessionTimeline.concat([
                    preload, enterFullscreen, welcomeTrial, getAge, getSex, checkVisionTrial, grabACreditCard, armsLengthInstruction, 
                    cameraInit, chinrest, cameraCalibrateInstructions, cameraCalibrate, generalInstructions, practiceTrialInstructions, practiceTrial,
                    measureDistortionTrial, practiceTrial, measureDistortionTrial
                ]);
                if (session.subject_number % 2 == 0)
                    sessionTimeline = sessionTimeline.concat([instructionsForExposure, runWithoutExposure, cameraValidationInstructions, cameraValidation, instructionsForAverageExposure, runWithExposure, cameraValidationInstructions, cameraValidation]);
                else
                    sessionTimeline = sessionTimeline.concat([instructionsForAverageExposure, runWithExposure, cameraValidationInstructions, cameraValidation, instructionsForExposure, runWithoutExposure, cameraValidationInstructions, cameraValidation]);
                sessionTimeline = sessionTimeline.concat([exitFullscreenTrial]);
                return sessionTimeline
            }(),
            on_trial_finish: session.insert,
            on_finish: function() {session.complete(CREDIT_URL)},
            override_safe_mode: true,
            show_progress_bar: true,
            extensions: [
                {type: 'webgazer'}
            ]
        });
    }
}
