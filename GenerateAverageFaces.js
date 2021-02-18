const { exec } = require('child_process');
const fs = require('fs');

const SUBJECT_COUNT = 30;
const FACE_TYPES = ['AAF', 'AAM', 'AF', 'AM', 'LF', 'LM', 'WF', 'WM'];
const FACE_PER_TYPE = 40;
const MIN_FACE = 1;

function GenerateRun(min, max)
{
    let array = []
    for (let i = min; i <= max; i++)
        array.push(i);
    return array;
}

function Shuffle(array)
{
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex)
    {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function CreateConfig(faceMin, faceMax, faceTypes)
{
    let config = {};
    for (let type of faceTypes)
    {
        let fullSet = GenerateRun(faceMin, faceMax);
        fullSet = Shuffle(fullSet);
        config[type] = {
            "testSet": fullSet.splice(0, fullSet.length/2),
            "realSet": fullSet
        }
    }
    return config;
}

function CreateSubjectConfigs(subjectCount)
{
    let subjectConfigs = [];
    for (let i = 0; i < subjectCount; i++)
    {
        subjectConfigs.push(CreateConfig(MIN_FACE, FACE_PER_TYPE, FACE_TYPES));
    }
    return subjectConfigs;
}

function SaveConfigs(configs)
{
    fs.writeFile('SubjectConfigs.cfg', `const SUBJECT_CONFIG='${JSON.stringify(configs)}'`, (error) => {
        if (error !== null)
            console.error(error);
    });
}

function Copy(source, destination, type, images)
{
    for (let image of images)
    {
        fs.copyFileSync(`${source}/${type}_${image}.jpg`, `${destination}/${type}_${image}.jpg`);
    }
}

function Delete(directory, type, images)
{
    for (let image of images)
    {
        fs.unlinkSync(`${directory}/${type}_${image}.jpg`);
    }
}

function Worker(subject, type, folder)
{
    let resultName = type;
    subject[type].realSet.forEach(element => resultName += `_${element}`);

    let command = `python3 facemorpher/averager.py --images=${folder}/ --out=out_folder/${resultName}.png --background=transparent`;

    return new Promise((resolve, reject) =>
    {
        console.log(resultName);
        Copy('examples', folder, type, subject[type].realSet);
        exec(command, (error, stdout, stderr) => {
        Delete(folder, type, subject[type].realSet);
        resolve();
        });
    });
}

async function main()
{
    let configs = CreateSubjectConfigs(SUBJECT_COUNT);
    SaveConfigs(configs);
    for (let subject of configs)
    {
        let workerList = [];
        for (let type in subject)
        {
            workerList.push(Worker(subject, type, type));
        }
        for (let worker of workerList)
        {
            await worker;
        }
    }
}

main();