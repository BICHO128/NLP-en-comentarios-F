import React, { useState } from 'react';

interface Teacher {
  id: number;
  name: string;
  subject: string;
  comments: string[];
}

interface Sections {
  overview: boolean;
  sentiment: boolean;
  categories: boolean;
  skills: boolean;
  trends: boolean;
}

interface TeacherDashboardProps {
  teachersData: Teacher[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teachersData }) => {
  const [expandedSections, setExpandedSections] = useState<Sections>({
    overview: false,
    sentiment: false,
    categories: false,
    skills: false,
    trends: false,
  });

  const toggleSection = (section: keyof Sections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div>
      <h1>Dashboard de Profesores</h1>
      {teachersData.map((teacher) => (
        <div key={teacher.id}>
          <h2>{teacher.name} - {teacher.subject}</h2>
          <button onClick={() => toggleSection('overview')}>
            {expandedSections.overview ? 'Ocultar' : 'Mostrar'} Información
          </button>
          {expandedSections.overview && <p>Comentarios: {teacher.comments.length}</p>}
        </div>
      ))}
    </div>
  );
};

export default TeacherDashboard;
