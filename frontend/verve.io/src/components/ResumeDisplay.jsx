import React from 'react';
import { Briefcase, GraduationCap, User, Code, Award, Mail, Phone } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Icon className="w-5 h-5 text-indigo-600" />
      {title}
    </h3>
    {children}
  </div>
);

const Tag = ({ children }) => (
  <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full mr-2 mb-2">
    {children}
  </span>
);

export default function ResumeDisplay({ parsed }) {
  if (!parsed) return null;

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <Section icon={User} title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xl font-semibold text-gray-900">{parsed.name || parsed.fullName || 'No name provided'}</p>
            {parsed.email && (
              <p className="text-gray-600 flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${parsed.email}`} className="hover:text-indigo-600">
                  {parsed.email}
                </a>
              </p>
            )}
            {parsed.phone && (
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4" />
                {parsed.phone}
              </p>
            )}
          </div>
          {parsed.summary && (
            <div className="text-gray-600">
              <p className="text-sm">{parsed.summary}</p>
            </div>
          )}
        </div>
      </Section>

      {/* Skills */}
      {parsed.skills?.length > 0 && (
        <Section icon={Code} title="Skills">
          <div className="flex flex-wrap">
            {parsed.skills.map((skill, i) => (
              <Tag key={i}>{skill}</Tag>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {parsed.experience?.length > 0 && (
        <Section icon={Briefcase} title="Experience">
          <div className="space-y-6">
            {parsed.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-indigo-200 pl-4 ml-2">
                <h4 className="font-semibold text-gray-900">{exp.title || exp.position}</h4>
                <p className="text-indigo-600 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-600">
                  {exp.start_date || exp.start} - {exp.end_date || exp.end || 'Present'}
                </p>
                <p className="mt-2 text-gray-700 text-sm">{exp.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {parsed.education?.length > 0 && (
        <Section icon={GraduationCap} title="Education">
          <div className="space-y-4">
            {parsed.education.map((ed, i) => (
              <div key={i} className="border-l-2 border-indigo-200 pl-4 ml-2">
                <h4 className="font-semibold text-gray-900">{ed.degree}</h4>
                <p className="text-indigo-600">{ed.institution || ed.school}</p>
                <p className="text-sm text-gray-600">
                  {ed.start_date} - {ed.end_date || 'Present'}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recommendations */}
      {parsed.recommendations?.length > 0 && (
        <Section icon={Award} title="Recommendations">
          <ul className="list-disc pl-5 space-y-2">
            {parsed.recommendations.map((rec, i) => (
              <li key={i} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}