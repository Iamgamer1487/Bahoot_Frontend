import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartComponent = () => {
  const data = {
    labels: ['Kahoot', 'Blooket', 'Gimkit', 'Bahoot'],
    datasets: [
      {
        label: 'Votes',
        data: [11, 32, 35, 42],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#ffffff', // Legend text color
          font: {
            size: 16,
            family: 'Arial',   // Optional: font family
            weight: 700,       // Use number for bold (700) instead of 'bold'
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default PieChartComponent;
