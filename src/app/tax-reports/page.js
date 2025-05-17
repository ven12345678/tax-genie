const handleDelete = async (reportId) => {
  if (!confirm('Are you sure you want to delete this tax report?')) {
    return;
  }

  try {
    const response = await fetch(`/api/tax-reports/${reportId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Remove the deleted report from the state
      setReports(prevReports => prevReports.filter(report => report._id !== reportId));
    } else {
      throw new Error('Failed to delete tax report');
    }
  } catch (error) {
    console.error('Error deleting tax report:', error);
    setError('Failed to delete tax report. Please try again.');
  }
};

{/* Tax Reports List */}
<div className="space-y-4">
  {reports.length > 0 ? (
    reports.map((report) => (
      <div key={report._id} className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{report.title}</h3>
            <p className="text-sm text-gray-500">
              Generated on: {new Date(report.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Tax Year: {report.taxYear}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownload(report._id)}
              className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              title="Download report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(report._id)}
              className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
              title="Delete report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No tax reports generated yet</p>
  )}
</div> 