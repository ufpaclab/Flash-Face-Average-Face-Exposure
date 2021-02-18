const jsSheet = {
  CreateSession: function(onSuccess, onFailure = console.error) {
    if (typeof(google) != "undefined") {
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
        }).GetSubjectNumber()
      }).GetSessionID()
    }
    else {
      console.error("\"google\" not defined: running in debug mode")
      onSuccess({
        id: -1,
        subject_number: 1,
        insert: function() {},
        complete: function() {}
      })
    }
  }
}