import React from 'react';
import styled from 'styled-components';
const GridWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  margin-top: 1em;
  margin-left: 6em;
  margin-right: 6em;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(25px, auto);
`;
export const Home = (props) => (
    <div className="padding">
        <h1 style={{fontFamily: 'Verdana', backgroundColor: 'lightgray'}}>Welcome</h1>
        <p style={{fontFamily: 'Verdana'}}>Feel free to use our chatbot at (paste link here)</p>
    </div>
    
)