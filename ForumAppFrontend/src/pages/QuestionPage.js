import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function QuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/questions/${id}/answer`, { replace: true });
  }, [id, navigate]);

  return null;
}
