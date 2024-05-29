const express = require("express");
const app = express();
var cors = require("cors");

app.use(cors());

const http = require("http");
const fetch = require("node-fetch");

app.listen(3000, () => console.log("lyssnar"));
app.use(express.static("public"));
app.use(express.json());

app.get("/api/:pn", async (request, response) => {
  const pn = request.params.pn;

  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDate = new Date();
  const numOfHours = 2;
  currentDate.setTime(currentDate.getTime() + numOfHours * 60 * 60 * 1000);
  let hour = currentDate.getHours();
  console.log(hour);
  var weekday = days[currentDate.getDay()];
  if (hour >= 14) {
    var day = currentDate.getDate() + 1;
  } else if (weekday == "Friday") {
    var day = currentDate.getDate() + 3;
  } else {
    var day = currentDate.getDate();
  }

  var month = currentDate.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  var year = currentDate.getFullYear();
  var dateTimeUTC = (await year) + "-" + month + "-" + day + "T13:00:00";
  console.log(dateTimeUTC);

  //instatoken
  const instaToken = await process.env.API_KEYINSTA;
  var raw = JSON.stringify({
    grant_type: "client_credentials",
    client_id: "7625664dc797939c544eb4354c9edafffc46",
    client_secret: `${instaToken}`,
  });
  var myHeaders = {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNTgyNDQ1ZGNlMzMwNmQxZTVlZTk4ZmE5IiwiaXNfYWRtaW4iOmZhbHNlLCJpc19wYXJ0bmVyX2FwaSI6dHJ1ZSwicGFydG5lcl9pZCI6IjU4MjQ0NWRiZTMzMDZkMWU1ZWU5OGZhOCIsImlhdCI6MTYzOTA2MTY4MiwiZXhwIjoxNjM5MTQ4MDgyfQ.EacJ1Lx7qjMRQlz3gM7t39cuKYXtnTnk3q5k3nGJ3mo",
    "Content-Type": "application/json",
  };

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "manual",
  };

  const test4 = await fetch(
    "https://oauth.instabox.se/v1/token",
    requestOptions
  )
    .then((test4) => {
      return test4.json();
    })
    .catch((test4) => {
      return "fel";
    });
  const token = await test4.token;

  //instabox här

  var myHeaders2 = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  var raw2 = JSON.stringify({
    recipient: {
      zip: `${pn}`,
      country_code: "SE",
    },
    services: [
      {
        service_type: "EXPRESS",
        dispatch_options: [
          {
            ready_to_pack: dateTimeUTC,
          },
        ],
        options: {
          num_delivery_options: 5,
          num_dispatch_options: 1,
          sort_dispatch_options_by: [],
        },
      },
    ],
  });

  var requestOptions2 = {
    method: "POST",
    headers: myHeaders2,
    body: raw2,
    redirect: "manual",
  };

  ////
  const postnord = await process.env.API_KEYPOST;
  const budbee = await process.env.API_KEYBUD;

  //Fetch Postnord
  const p5 = fetch(
    `https://atapi2.postnord.com/rest/businesslocation/v5/servicepoints/nearest/byaddress?returnType=json&countryCode=SE&postalCode=${pn}&numberOfServicePoints=5&context=optionalservicepoint&responseFilter=public&typeId=24%2C25%2C54&apikey=${postnord}`
  )
    .then((r) =>
      r.json().then((data) => {
        let post = "";
        for (
          let i = 0;
          i < 5 &&
          i < data.servicePointInformationResponse.servicePoints.length;
          i++
        ) {
          post +=
            "<option>" +
            data.servicePointInformationResponse.servicePoints[i].name +
            "</option>";
        }

        return post;
      })
    )
    .catch((p5) => {
      return "fel";
    });
  //Fetch Instabox
  const p6 = fetch(
    "https://availability.instabox.se/v3/availability",
    requestOptions2
  )
    .then((r) =>
      r.json().then((data) => {
        let ins = "";
        if (
          data.availability.EXPRESS.dispatch_options[0].delivery_options
            .length === 0
        ) {
          return "fel";
        } else {
          for (
            let i = 0;
            i < 5 &&
            i <
              data.availability.EXPRESS.dispatch_options[0].delivery_options
                .length;
            i++
          ) {
            ins +=
              "<option>" +
              data.availability.EXPRESS.dispatch_options[0].delivery_options[i]
                .description +
              "</option>";
          }
          return ins;
        }
      })
    )
    .catch((p6) => {
      return "fel";
    });
  //Fetch Budbee
  const p7 = fetch(
    `https://api.budbee.com/boxes/postalcodes/validate/SE/${pn}`,
    {
      headers: {
        Authorization: `${budbee}`,
      },
    }
  )
    .then((r) =>
      r
        .json()
        .then((data) => data.lockers)
        .then((data) => {
          let ins = "";
          if (data.length === 0) {
            return "fel";
          } else {
            for (let i = 0; i < 5 && i < data.length; i++) {
              ins += "<option>" + data[i].name + "</option>";
            }
            return ins;
          }
        })
    )
    .catch((p7) => {
      return "fel";
    });

  //wait for all to resovle
  const complete = Promise.all([p5, p6, p7]).then(([p44, p55, p66]) => {
    response.send({
      post: p44,
      ins: p55,
      bud: p66,
    });
  });
});
