'use server';

import { getServerSession } from "next-auth/next";
import { authConfig } from "../api/auth/[...nextauth]/route";
import { google } from "googleapis";


export async function add_to_calendar(courseObj: object) {
  extract_eventDetails(courseObj);

  const session = await getServerSession(authConfig);
  if (!session) {
    console.log("erm what");
    return {};
  }
  console.log("Session successful");

  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  auth.setCredentials({
    access_token: session?.accessToken,
    refresh_token: session?.refreshToken,
    });
  console.log("Connection successful");

  const calendar = google.calendar({ auth, version: "v3" });
  let calendar_id = "";
  let calendarList_obj = await calendar.calendarList.list()
  let calendar_items = calendarList_obj.data.items;
  for (let i=0; i<calendar_items.length; i++) {
    const cal_obj = calendar_items[i];
    if (cal_obj?.summary == "Courses-To-Cal") {
      console.log("found calendar");
      calendar_id = cal_obj?.id;
      }
    }
  if (calendar_id == "") {
    // Insert the new calendar
    console.log("creating calendar");
    let createdCalendar = await calendar.calendars.insert({
      requestBody: {
        summary: 'Courses-To-Cal',
        timeZone: 'America/Los_Angeles',
        },
      });
    calendar_id = createdCalendar.data.id;
  }
  
  const eventsList_obj = await calendar.events.list({
    'calendarId': calendar_id,
    'showDeleted': true,
  });
  let event_ids = [];
  for (let k=0; k<eventsList_obj.data.items.length; k++) {
    let event = eventsList_obj.data.items[k];
    console.log(event.id);
    event_ids.push(event.id)
  }
  for (let i=0; i<courseObj.eventDetails.length; i++) {
    let event_details = courseObj.eventDetails[i]
    let resource = {
      'id' : event_details[0],
      'summary': courseObj.course.concat(" ", courseObj.title),
      'description': courseObj.location[i],
      'start': {
        'dateTime': event_details[1],
        'timeZone': 'America/Los_Angeles',
      },
      'end': {
        'dateTime': event_details[2],
        'timeZone': 'America/Los_Angeles',
      },
      'recurrence': [
        ('RRULE:FREQ=WEEKLY;UNTIL=').concat(event_details[3], ";BYDAY=", event_details[4])
      ],
      }
    if (!(event_ids.includes(event_details[0]))) {
      try {
        await calendar.events.insert({
          'calendarId': calendar_id,
          'resource': resource,
          });
        console.log("created new");
        }
      catch { 
        remove_from_calendar(courseObj);
        return {}; }
    }
    else {
      try {
        await calendar.events.update({
          'calendarId': calendar_id,
          'eventId': event_details[0],
          'resource': resource,
          });
        console.log("updated!");
        }
      catch { 
        remove_from_calendar(courseObj);
        return {}; }
      }
    }
  return courseObj;

}


const first_week = [ // first weekdays returning to school in order M-F
  ["M", "2024-09-30"],
  ["T", "2024-10-01"],
  ["W", "2024-09-25"],
  ["R", "2024-09-26"],
  ["F", "2024-09-27"],
];
const last_day = ["F", "2024-12-06"]; // last day of the quarter
const instruction_start = 2;

function extract_eventDetails(courseObj: object) {
  console.log(courseObj);
  let eventDetails = [];

  let timing_array = courseObj.timing;
  for (let i=0; i<timing_array.length; i++) {
    let timing = timing_array[i];
    let start_time, finish_time, select_AmPm, days;
    [start_time, timing] = timing.split(" - ");
    [finish_time, select_AmPm, days] = timing.split(" ");

    let convert_24hrFormat = (time, select_AmPm) => {
      let [hours, minutes] = time.split(":");
      if (select_AmPm == "PM,") {
        if (hours != "12") {
          hours = (parseInt(hours)+12).toString();
          }
        }
      else if (hours == "12") {
        hours = "00";
        }
      return (hours.concat(":", minutes)).padStart(5, "0");
      }
    
    finish_time = convert_24hrFormat(finish_time, select_AmPm);
    let [start_hour, start_min] = start_time.split(":");
    if (select_AmPm == "PM," && parseInt(start_hour)>=10) {
      select_AmPm = "AM,"
      }
    start_time = convert_24hrFormat(start_time, select_AmPm);
    days = days.trim();
    console.log(start_time);
    console.log(finish_time);
    
    let start_day_index = -1;
    let bydays = "";
    let get_relativeIndex = (index, start_index) => {
      let relative_index = index - start_index; // start_index becomes 0 point 
      if (relative_index < 0) {
        relative_index = (4-start_index) + index; 
      }
      return relative_index;
    }
    for (let j=0; j<days.length; j++) {
      let day = days[j];
      console.log(day);
      let z;
      if (day == "M") { bydays = bydays.concat("MO,"); z=0 }
      else if (day == "T") { bydays = bydays.concat("TU,"); z=1 }
      else if (day == "W") { bydays = bydays.concat("WE,"); z=2 }
      else if (day == "R") { bydays = bydays.concat("TH,"); z=3 }
      else { bydays = bydays.concat("FR"), z=4 }
      
      if (start_day_index == -1) {
        start_day_index = z;
        continue;
        }

      if (get_relativeIndex(z, instruction_start) < get_relativeIndex(start_day_index, instruction_start)) {
        start_day_index = z
        }
      }
    let event = [];
    event.push(courseObj.crn.concat("e", i)); //eventId
    event.push(first_week[start_day_index][1].concat("T", start_time, ":00-07:00")); //start
    event.push(first_week[start_day_index][1].concat("T", finish_time, ":00-07:00")); //end
    event.push((last_day[1].split("-").join("")).concat("T235900Z")) //until
    event.push(bydays); //bydays
    eventDetails.push(event);
  }
  courseObj.eventDetails = eventDetails;
  return;
}


export async function remove_from_calendar(courseObj: object) {
  const session = await getServerSession(authConfig);
  if (!session) {
    console.log("erm what");
    return;
  }
  console.log("Session successful");

  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  auth.setCredentials({
    access_token: session?.accessToken,
    refresh_token: session?.refreshToken,
    });
  console.log("Connection successful");

  const calendar = google.calendar({ auth, version: "v3" });
  let calendar_id = "";
  let calendarList_obj = await calendar.calendarList.list()
  let calendar_items = calendarList_obj.data.items;
  for (let i=0; i<calendar_items.length; i++) {
    const cal_obj = calendar_items[i];
    if (cal_obj?.summary == "Courses-To-Cal") {
      console.log("found calendar");
      calendar_id = cal_obj?.id;
      }
    }
  if (calendar_id == "") {
    return;
  }
  
  for (let i=0; i<courseObj.eventDetails.length; i++) {
    let event_id = courseObj.eventDetails[i][0];
    try {
      await calendar.events.delete({
        'calendarId': calendar_id,
        'eventId': event_id,
        });
      }
    catch { continue; }//the possible error is that the event is already deleted
    }
  console.log("successfully deleted!")
  return;

}