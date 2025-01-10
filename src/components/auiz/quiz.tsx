// src/components/QuizCard.tsx
import React from 'react';
import { Card, Tag, Progress } from 'antd';
import { Link } from 'react-router-dom';

interface QuizCardProps {
    quiz: Quiz;
    progress?: number;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, progress }) => {
    return (
        <Card
            className="w-full shadow-sm hover:shadow-md transition-shadow"
            title={quiz.topic}
            extra={< Tag color={quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'medium' ? 'orange' : 'red'} > {quiz.difficulty} </>
            }
        >
            <div className="space-y-4" >
                <p className="text-gray-600" > {quiz.total_questions} questions </p>
                {
                    quiz.time_limit && (
                        <p className="text-gray-600" > Time limit: {quiz.time_limit} minutes </p>
                    )
                }
                {
                    progress !== undefined && (
                        <Progress percent={progress} size="small" />
                    )
                }
                <Link
                    to={`/quiz/${quiz.quiz_id}`}
                    className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Start Quiz
                </Link>
            </div>
        </Card>
    );
};

// src/components/QuestionView.tsx
import React from 'react';
import { Radio, Button, Card, Space } from 'antd';

interface QuestionViewProps {
    question: Question;
    onSubmit: (answer: string) => void;
    timeLeft?: number;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ question, onSubmit, timeLeft }) => {
    const [selected, setSelected] = React.useState<string>('');

    return (
        <Card className="w-full max-w-2xl mx-auto" >
            <div className="space-y-6" >
                {timeLeft && (
                    <div className="text-right text-gray-600" >
                        Time left: {Math.floor(timeLeft / 60)}: {(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                )}

                <h3 className="text-xl font-medium" > {question.text} </h3>

                < Radio.Group
                    className="w-full space-y-3"
                    onChange={e => setSelected(e.target.value)}
                    value={selected}
                >
                    <Space direction="vertical" className="w-full" >
                        {
                            question.options.map((option, idx) => (
                                <Radio key={idx} value={option} className="w-full p-3 border rounded hover:bg-gray-50" >
                                    {option}
                                </Radio>
                            ))
                        }
                    </Space>
                </Radio.Group>

                < Button
                    type="primary"
                    block
                    disabled={!selected}
                    onClick={() => onSubmit(selected)}
                >
                    Submit Answer
                </Button>
            </div>
        </Card>
    );
};

// src/components/ProgressChart.tsx
import React from 'react';
import { Line } from '@ant-design/plots';

interface ProgressChartProps {
    data: {
        topic: string;
        score: number;
        date: string;
    }[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
    const config = {
        data,
        xField: 'date',
        yField: 'score',
        seriesField: 'topic',
        point: {
            size: 5,
            shape: 'diamond',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
    };

    return <Line {...config} />;
};