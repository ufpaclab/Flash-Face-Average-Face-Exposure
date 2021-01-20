const jsSheet = {
  CreateSession: function(onSuccess, onFailure = console.error) {
    if (typeof(google) != "undefined") {
      google.script.run.withFailureHandler(onFailure).withSuccessHandler(CreateLocalSession).GetSessionID()

      function CreateLocalSession(id) {
        onSuccess({
          id: id,
          insert: function(data) {
            google.script.run.withFailureHandler(onFailure).Insert(id, data)
          }
        })
      }
    }
    else {
      console.error("\"google\" not defined: running in debug mode")
      onSuccess({
        id: -1,
        insert: function() {}
      })
    }
  }
}