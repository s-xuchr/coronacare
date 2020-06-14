import React from 'react';
import styled from 'styled-components';
import './components/Pages.css';
const GridWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  margin-top: 1em;
  margin-left: 6em;
  margin-right: 6em;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(25px, auto);
`; 
export const About = () => (
    <div className="padding">
        <h2>About Page</h2>
        <p> coronacare.ai is a Facebook Messenger chatbot tailored specifically for those in need of assistance during the COVID-19 pandemic. </p> 
        <p> Ask it questions about COVID-19 to get the latest news and data about the pandemic or simply prompt it for ways to spend your time while in quarantine. </p>
        <p> Using the bot, you can: </p>
        <ul>
          <li> Ask questions about COVID-19 </li>
          <li> Find local therapists and other resources to suit your needs </li>
          <li> Request to join a support group </li>
        </ul>
        <p> To get started, message "Hello" to Coronacare.ai on Facebook messenger! </p>
    </div>
)