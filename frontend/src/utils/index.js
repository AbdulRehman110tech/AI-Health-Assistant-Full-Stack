export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const getConfidenceColor = (confidence) => {
  if (confidence >= 70) return '#00FF87'
  if (confidence >= 40) return '#00D4FF'
  return '#FF6B6B'
}