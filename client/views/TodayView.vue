<template>
    <div class="today-view">
      <div class="header">
        <div class="date-info">
          <h1>Sunday, 17 November</h1>
          <p>Period Day</p>
        </div>
        <div class="header-actions">
          <button class="btn checklist">Daily Checklist</button>
          <button class="btn export">Export</button>
        </div>
      </div>

      <div class="content">
        <textarea class="journal" placeholder="How did your day go..."></textarea>

        <div class="mood-section">
          <h2>Mood</h2>
          <div class="options">
            <button>Angry</button>
            <button>Happy</button>
            <button>Calm</button>
            <button>Sad</button>
            <button>Confused</button>
          </div>
        </div>

        <div class="flow-section">
          <h2>Flow Intensity</h2>
          <div class="options">
            <button>Light</button>
            <button>Medium</button>
            <button>Heavy</button>
          </div>
        </div>

        <div class="symptoms-section">
          <h2>Symptoms</h2>
          <div class="options">
            <button>Abdominal Cramps</button>
            <button>Headache</button>
            <button>Acne</button>
            <button>Fatigue</button>
            <button>Constipation</button>
            <button>Diarrhea</button>
            <button>Nausea</button>
            <button>Bloating</button>
            <button>Chills</button>
            <button>Mood swings</button>
            <button>Dry skin</button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  // Logic or imports can be added here
  </script>

  <style scoped>
  /* General Styles */
  .today-view {
    font-family: 'Arial', sans-serif;
    color: #fff;
    background-color: #ffc1c1;
    border-radius: 10px;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .date-info h1 {
    font-size: 1.5rem;
    margin: 0;
    color: #fff;
  }

  .date-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #ffe3e3;
  }

  .header-actions .btn {
    background-color: #f09b9b;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    color: #fff;
    cursor: pointer;
  }

  .header-actions .btn.checklist {
    margin-right: 0.5rem;
  }

  /* Content */
  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .journal {
    width: 100%;
    height: 100px;
    border-radius: 10px;
    border: 1px solid #ffb6b6;
    padding: 0.5rem;
    background-color: #fff;
    color: #333;
    resize: none;
  }

  /* Sections */
  .mood-section,
  .flow-section,
  .symptoms-section {
    background-color: #ffb3b3;
    border-radius: 10px;
    padding: 0.75rem;
  }

  h2 {
    font-size: 1.2rem;
    margin: 0 0 0.5rem;
  }

  /* Options */
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .options button {
    background-color: #ffe0e0;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    cursor: pointer;
    color: #333;
  }

  .options button:hover {
    background-color: #ffc0c0;
  }
  </style>
