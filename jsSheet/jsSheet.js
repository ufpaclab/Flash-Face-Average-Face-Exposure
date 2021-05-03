const jsSheet = {
  CreateSession: function(onSuccess, onFailure = console.error) {
    if (typeof(google) == "undefined") {
      console.error("\"google\" not defined: running in debug mode")
      onSuccess({
        id: -1,
        subject_number: 1,
        insert: function(data) {
          try {
            console.log(data.webgazer_data);
            let Accumulator = {
              x: 0,
              y: 0,
              count: 0
            };

            for (let sample of data.webgazer_data) {
              Accumulator.x += sample.x;
              Accumulator.y += sample.y;
              Accumulator.count++;
            }

            data.webgazer_x = Accumulator.x / Accumulator.count;
            data.webgazer_y = Accumulator.y / Accumulator.count;
            data.fixation_x = data.webgazer_targets['.flashFaceFixation'].left + data.webgazer_targets['.flashFaceFixation'].right;
            data.fixation_y = data.webgazer_targets['.flashFaceFixation'].top + data.webgazer_targets['.flashFaceFixation'].bottom;
            delete data.webgazer_data;
            delete data.webgazer_targets;
            console.log(data);
          }
          catch(e) {
            console.error(e);
          }
        },
        complete: function(url) {
          console.log(url);
        }
      })
    }

    google.script.run.withFailureHandler(onFailure).withSuccessHandler((id) => {
      google.script.run.withFailureHandler(onFailure).withSuccessHandler((subject_number) => {
        onSuccess({
          id: id,
          subject_number: subject_number,
          insert: function(data) {
            google.script.run.withFailureHandler(onFailure).Insert(id, subject_number, data)
          },
          complete: function(redirectUrl) {
            google.script.run.withFailureHandler(onFailure).withSuccessHandler(() => {
              window.top.location.href = redirectUrl
            }).CompleteSubject(subject_number)
          }
        })
      }).GetSubject()
    }).GetSessionID()
  }
}