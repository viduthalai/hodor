$(document).ready(function() {
  var main = {
    init: function() {
      this.activeTasks = [];
      this.taskLists = [];
      this.startGetResults;
      this.initEvents();
      this.getBranches();
    },
    initEvents: function() {
      $("#select_brand").on("change", $.proxy(this.getProfiles, this));
      $("#profiles_list").on("change", $.proxy(this.getTaskLists, this));
      $("#run_submit").on("click", $.proxy(this.submitTasks, this));
      $("#stop_submit").on("click", $.proxy(this.stopTasks, this));
      $("#reset_all").on("click", $.proxy(this.resetAll, this));
      $("#update_submit").on("click", $.proxy(this.updateRate, this));
      $("#task_lists")
        .multiselect({
          allSelectedText: "All",
          maxHeight: 200,
          includeSelectAllOption: true
        })
        .multiselect("updateButtonText");
      $("#active_task_lists")
        .multiselect({
          allSelectedText: "All",
          maxHeight: 200,
          includeSelectAllOption: true
        })
        .multiselect("updateButtonText");
    },
    updateDropDowns: function(nodeId, val, type) {
      var data = [];
      if (type === "multi") {
        for (var i = 0; i < val.length; i++) {
          obj = JSON.parse('{"label": "'+ val[i] +'", "title": "' + val[i] + '", "value": "' + val[i] +'"}')
          data.push(obj)
        }
        console.log(data);
        $("#" + nodeId).multiselect("dataprovider", data);
        $("#" + nodeId).multiselect("rebuild");
      } else {
          $("#" + nodeId).empty();
        $("#" + nodeId).append(
          "<option value=" + "" + "> Select </option>");
        $.map(val, function(x) {
          return $("#" + nodeId).append(
            "<option value=" + x + ">" + x + "</option>"
          );
        });
      }
    },
    getBranches: function() {
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/getbranches",
        dataType: "json",
        method: "GET",
        success: $.proxy(function(response) {
          this.updateDropDowns("select_brand",response, "single");
          $("#select_brand")
            .parent()
            .removeClass("d-none");
        }, this)
      });
    },

    getProfiles: function(e) {
      var $this = $(e.currentTarget);
      var selectedBranch = $this.val();
      $this.attr("disabled", "disabled");
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/getprofiles",
        dataType: "json",
        method: "GET",
        data: { selectedBranch: selectedBranch },
        success: $.proxy(function(response) {
          this.updateDropDowns("profiles_list", response, "single");
          $("#profiles_list")
            .parent()
            .removeClass("d-none");
        }, this)
      });
    },
    getTaskLists: function(e) {
      var $this = $(e.currentTarget);
      var selectedProfile = $this.val();
      $this.attr("disabled", "disabled");
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/getalltasks/" + selectedProfile,
        dataType: "json",
        method: "GET",
        success: $.proxy(function(response) {
          $("#task_lists, #run_submit")
            .parents("li")
            .removeClass("d-none");

          this.updateDropDowns("task_lists", response, "multi");
        }, this)
      });
    },
    submitTasks: function(e) {
      var selectedTasks = $("#task_lists").val();
      var self = this;
      var tasks = "";
      for (var i = 0; i < selectedTasks.length; i++) {
        tasks = tasks + selectedTasks[i] + ","
      }
      tasks = tasks.slice(0, -1);
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/runtask/"+ tasks,
        dataType: "json",
        method: "GET",
        success: $.proxy(function(response) {
          $("#active_task_lists, #stop_submit")
            .parents("li")
            .removeClass("d-none");

          this.updateDropDowns("active_task_lists", selectedTasks, "multi");
          self.getActiveTasks(response);
        }, this)
      });
    },
    stopTasks: function(e) {
      var selectedTasks = $("#active_task_lists").val();
      var self = this;
      var tasks = "";
      for (var i = 0; i < selectedTasks.length; i++) {
        tasks = tasks + selectedTasks[i] + ","
      }
      tasks = tasks.slice(0, -1);
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/stopTask/"+ tasks,
        dataType: "json",
        method: "GET",
        success: $.proxy(function(response) {
          if (response === "200") {
            $("#stop_notify .alert-info").removeClass("d-none");
          } else {
            $("#stop_notify .alert-danger").removeClass("d-none");
          }
          setTimeout(function() {
            $("#stop_notify .alert").addClass("d-none");
          }, 5000)
        }, this)
      });
    },
    updateRate: function() {
      var activeTask = $("#active_task").val();
      var rateValue = $("#rate_value").val();
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/updateTaskRate/"+activeTask+"/"+rateValue,
        dataType: "json",
        method: "GET",
        success: $.proxy(function(response) {
          if (response === "200") {
            $("#notify .alert-info").removeClass("d-none");
          } else {
            $("#notify .alert-danger").removeClass("d-none");
          }
          setTimeout(function() {
            $("#notify .alert").addClass("d-none");
          }, 5000);
        }, this)
      });
    },
    getActiveTasks: function(response) {
      var self = this
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/getActiveTasks",
        dataType: "json",
        method: "GET",
        // data: { selectedBrand: selectedTasks },
        success: $.proxy(function(response) {
          console.log(response);
          if(response.length > 0){
            $("#active_task")
            .parents("li")
            .removeClass("d-none");
            this.updateDropDowns("active_task", response, "single");
            $("#update_block").removeClass("d-none");
            self.getTasksResults();
            this.startGetResults = setInterval(function() {
              self.getTasksResults(response);
            }, 10000);
          } else {
            console.log("clearning results");
            clearInterval(this.startGetResults);
          }

        }, this)
      });
    },
    getTasksResults: function(response) {
      $.ajax({
        url: "http://localhost:8080/api/v1/hudor/getresults",
        dataType: "json",
        method: "GET",
        // data: { selectedBrand: selectedTasks },
        success: $.proxy(function(response) {
          if(response.length > 0){
            this.paintResults(response);
          } else {
              $("#results_card").empty()
              clearInterval(this.startGetResults);
          }

        }, this)
      });
    },
    paintResults: function(response) {
      var self = this;
      var $parent = $("#results_card");
      $parent.empty();
      setTimeout(
        $.proxy(function() {
          response.forEach(function(val) {
            val = JSON.parse(val)
            $parent.append(self.getMarkUp(val));
          });
        }, this),
        500
      );

      $("#empty_search").addClass("d-none");
      $parent.removeClass("d-none");
    },
    getSelectedArray: function() {},
    getMarkUp: function(res) {
      return (
        '<div class="col-md-6 col-xl-3 mb-4"><div class="border-left-primary card h-100 py-2 shadow"><div class=card-body><div class="align-items-center no-gutters row"><div class="col mr-2 text-center"><div class="font-weight-bold h5 mb-1 text-primary text-sm text-uppercase">' +
        res.title +
        '</div><br></div></div><div class="align-items-center no-gutters row"><div class="col mr-2 text-center"><div class="font-weight-bold mb-1 text-sm text-uppercase text-success">Success</div><div class="font-weight-bold h5 mb-0 text-gray-800">' +
        res.success +
        '</div></div><div class="col mr-2 text-center"><div class="font-weight-bold mb-1 text-sm text-uppercase text-warning">Rate</div><div class="font-weight-bold h5 mb-0 text-gray-800">' +
        res.rate +
        '</div></div><div class="col mr-2 text-center"><div class="font-weight-bold mb-1 text-sm text-uppercase text-danger">ERROR</div><div class="font-weight-bold h5 mb-0 text-gray-800">' +
        res.error +
        "</div></div></div></div></div></div>"
      );
    },
    resetAll: function() {
      clearInterval(this.startGetResults);
      location.reload("forcedReload");
    }
  };
  main.init();
});
