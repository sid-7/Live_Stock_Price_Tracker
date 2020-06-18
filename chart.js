// checks whether the request is within the working hours of US stock market.
function checkTime(){
    var startTime = new Date();
    var endTime = new Date();
    startTime.setHours(7,00,0);
    endTime.setHours(12,00,0);

    var currentTime = new Date();
    if(currentTime < startTime || currentTime > endTime){
          alert("Stock Market is Closed Right Now. Showing the Last Closing Price.");
    }
}

checkTime();


var dict = {};
var companyIndexMapping = {};
var body = document.getElementById("button_area");
var bar = document.getElementById('barChart').getContext('2d');
var line = document.getElementById('lineChart').getContext('2d');

// creating a bar chart using chart.js library
var bar_chart = new Chart(bar, {
    type: 'bar',
    data: {
        labels: [],
        datasets: []
    },

    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales:{
          yAxes:[{
                  scaleLabel:{
                          display:true,
                          labelString: 'Stock Price'
                        }
                }],
          xAxes: [{
                    barThickness: 15,
                    maxBarThickness: 18,
                    scaleLabel:{
                          display:true,
                          labelString: 'Company Symbol'
                          }
                  }]
      },
      tooltips:{
        mode: 'index',
        intersect: false
      }
    }
});


// creating a line chart using chart.js library
var line_chart = new Chart(line, {
  type:'line',
  data: {
      datasets:[]},
   options: {
        responsive: false,
          maintainAspectRatio: false,
        scales: {
          yAxes:[{
                  scaleLabel:{
                          display:true,
                          labelString: 'Stock Price'
                        }
                }],
          xAxes: [{
              scaleLabel:{
                          display:true,
                          labelString: 'Time'
                        },
              type: 'time',
              time:{
                unit:'second'
                }
            }]
            }
      }
});


// Add the company name in the list and starts fetching data from the API.
function onCompanyAdd(){  
      var company_name = document.getElementById("company").value;
      var button = document.createElement("button");
      button.innerHTML = company_name;  
      body.appendChild(button);

      dict[company_name] = new XMLHttpRequest();
      openConn(company_name, 0);
      dict[company_name].send();
}


// generates a random color everytime a new company is added
function generateRandomColor()
{
    var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
    return randomColor;
}


//opens a connections to the tiingo API and event-listener is placed to retrieve the data as soon as possible.
function openConn(company, update_flag){
      dict[company].open("GET","https://api.tiingo.com/iex/"+company+"?token=4cc02f254b409ed700efa60cf460feb0a7e2ca2a", true);
      dict[company].onreadystatechange = () => {
                    getDataFromAPI(dict[company], company, update_flag);
      };
}


//retrives the data if the connection is made else console message is passed.
function getDataFromAPI(req_obj, company, update){
  if(req_obj.readyState === XMLHttpRequest.DONE) 
      {
        var status = req_obj.status;

        if (status === 0 || (status >= 200 && status < 400))
         {
          let x = req_obj.responseText;
          var price = parseFloat(JSON.parse(x.substring(1, x.length -1 ))["last"]);
                        if (update === 0) 
                        {
                            addDataToChart(company, price);  
                            companyIndexMapping[company] = Object.keys(companyIndexMapping).length;

                        }
                        else{
                            updateDataInChart(price, companyIndexMapping[company]);
                        }

        }
        else {
          console.log("Failed to retrieve data");
        }
    }
}


//adding a new company data to the both the charts
function addDataToChart(label_, data){
  let color = generateRandomColor();

  var bar_data = {
          label: label_,
          backgroundColor: color,
          data:[data]
        };

  var line_data = {
          label: label_,
          borderColor: color,
          data:[{ x:moment(new Date().toLocaleString()).format("YYYY-MM-DD h:mm:ss"), y:data }]
      };

  bar_chart.data.datasets.push(bar_data);
  line_chart.data.datasets.push(line_data);

  bar_chart.update();
  line_chart.update();
}


//updating the current company data in the charts
function updateDataInChart(data, index){
  bar_chart.data.datasets[index].data[0] = data;
  bar_chart.update();

  line_chart.data.datasets[index].data.push({ x:moment(new Date().toLocaleString()).format("YYYY-MM-DD h:mm:ss"), y:data });
  line_chart.update();
}


// update the data in the chart every 5 seconds by fetching the latest data from the api
function updateData(){
    for (var key in dict){
      openConn(key, 1);
      dict[key].send();
    }

    setTimeout(()=> {updateData()}, 5000);
}


updateData();