$(document).ready(function() {
  var main = {
    init: function() {
      this.activeTasks = [];
      this.taskLists = [];
      this.startGetResults;
      this.optData = [
        { label: "Option 1", value: "1" },
        { label: "Option 2", value: "2" },
        { label: "Option 3", value: "3" },
        { label: "Option 4", value: "4" },
        { label: "Option 5", value: "5" }
      ];
      this.taskLists = [
        { label: "Option 1", title: "Option 1", value: "1" },
        { label: "Option 2", title: "Option 2", value: "2" },
        { label: "Option 3", title: "Option 3", value: "3" },
        { label: "Option 4", title: "Option 4", value: "4" },
        { label: "Option 5", title: "Option 5", value: "5" }
      ];
      this.initEvents();
      this.getBranches();
    },
    initEvents: function() {
      $("#select_brand").on("change", $.proxy(this.getProfiles, this));
      $("#profiles_list").on("change", $.proxy(this.getTaskLists, this));
      $("#run_submit").on("click", $.proxy(this.submitTasks, this));
      $("#reset_all").on("click", $.proxy(this.resetAll, this));
      $("#update_submit").on("click", $.proxy(this.updateRate, this));
      $("#task_lists")
        .multiselect({
          allSelectedText: "All",
          maxHeight: 200,
          includeSelectAllOption: true
        })
        .multiselect("updateButtonText");
    },
    updateDropDowns: function(nodeId, val, type) {
      if (type === "multi") {
        $("#" + nodeId).multiselect("dataprovider", val);
        $("#" + nodeId).multiselect("rebuild");
      } else {
        $.map(val, function(x) {
          return $("#" + nodeId).append(
            "<option value=" + x.value + ">" + x.label + "</option>"
          );
        });
      }
    },
    getBranches: function() {
      $.ajax({
        url: "http://dummy.restapiexample.com/api/v1/employees",
        dataType: "json",
        method: "GET",
        success: $.proxy(function(resposone) {
          this.updateDropDowns("select_brand", this.optData, "single");
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
        url: "http://dummy.restapiexample.com/api/v1/employees",
        dataType: "json",
        method: "GET",
        data: { selectedBranch: selectedBranch },
        success: $.proxy(function() {
          this.updateDropDowns("profiles_list", this.optData, "single");
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
        url: "http://dummy.restapiexample.com/api/v1/employees",
        dataType: "json",
        method: "GET",
        data: { selectedBrand: selectedProfile },
        success: $.proxy(function() {
          $("#task_lists, #run_submit")
            .parents("li")
            .removeClass("d-none");

          this.updateDropDowns("task_lists", this.taskLists, "multi");
        }, this)
      });
    },
    submitTasks: function(e) {
      $(e.currentTarget).attr("disabled", "disabled");
      var selectedTasks = $("#task_lists").val();
      var self = this;
      $.ajax({
        url: "http://dummy.restapiexample.com/api/v1/employees",
        dataType: "json",
        method: "GET",
        data: { selectedBrand: selectedTasks },
        success: $.proxy(function(response) {
          self.getTasksResults(response);
          this.startGetResults = setInterval(function() {
            self.getTasksResults(response);
          }, 10000);
        }, this)
      });
    },
    updateRate: function() {
      var activeTask = $("#active_task").val();
      var rateValue = $("#rate_value").val();
      $.ajax({
        url: "http://dummy.restapiexample.com/api/v1/employees",
        dataType: "json",
        method: "GET",
        data: {
          activeTask: activeTask,
          rateValue: rateValue
        },
        success: $.proxy(function(response) {
          if (response.status === "ok") {
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
    getTasksResults: function(response) {
      $.ajax({
        url: "http://dummy.restapiexample.com/api/v1/employees",
        dataType: "json",
        method: "GET",
        // data: { selectedBrand: selectedTasks },
        success: $.proxy(function(response) {
          $("#active_task")
            .parents("li")
            .removeClass("d-none");
          this.paintResults();

          this.updateDropDowns("active_task", this.optData, "single");
          $("#update_block").removeClass("d-none");
        }, this)
      });
    },
    paintResults: function(response) {
      response = {};
      var self = this;
      var $parent = $("#results_card");
      $parent.empty();
      response.data = [
        {
          title: "title1",
          success: "3404",
          latency: "5443",
          error: "4343"
        },
        {
          title: "title2",
          success: "404",
          latency: "232",
          error: "45443"
        },
        {
          title: "title3",
          success: "7604",
          latency: "657",
          error: "433"
        },
        {
          title: "title4",
          success: "37604",
          latency: "324",
          error: "466643"
        },
        {
          title: "title5",
          success: "37604",
          latency: "775",
          error: "466643"
        }
      ];
      setTimeout(
        $.proxy(function() {
          response.data.forEach(function(val) {
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
        '</div></div><div class="col mr-2 text-center"><div class="font-weight-bold mb-1 text-sm text-uppercase text-warning">Latency</div><div class="font-weight-bold h5 mb-0 text-gray-800">' +
        res.latency +
        '</div></div><div class="col mr-2 text-center"><div class="font-weight-bold mb-1 text-sm text-uppercase text-danger">Failed</div><div class="font-weight-bold h5 mb-0 text-gray-800">' +
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
