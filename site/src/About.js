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
        <p>This is a chatbot made by Ryan Kee, Albert Su, Christianna Xu, and Emma Yokota</p>
    </div>
)