import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getCampaigns, OutboundCampaign } from '../../lib/outbound';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X, ArrowRight } from 'lucide-react';

interface CSVRow {
  [key: string]: string;
}

interface FieldMapping {
  csvColumn: string;
  prospectField: string;
}

const PROSPECT_FIELDS = [
  { value: '', label: 'Skip this column' },
  { value: 'prospect_name', label: 'Prospect Name' },
  { value: 'prospect_email', label: 'Prospect Email' },
  { value: 'prospect_title', label: 'Prospect Title' },
  { value: 'prospect_linkedin_url', label: 'Prospect LinkedIn URL' },
  { value: 'company_name', label: 'Company Name' },
  { value: 'company_size', label: 'Company Size (number)' },
  { value: 'company_industry', label: 'Company Industry' },
  { value: 'company_website', label: 'Company Website' },
  { value: 'company_location', label: 'Company Location' },
];

export default function CSVUpload() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<OutboundCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'importing'>('upload');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResults, setImportResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  useState(() => {
    loadCampaigns();
  });

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError('');

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        setError('CSV file is empty');
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      setCsvHeaders(headers);

      // Initialize field mappings with smart defaults
      const initialMappings: FieldMapping[] = headers.map(header => {
        const lowerHeader = header.toLowerCase();
        let prospectField = '';

        // Smart matching
        if (lowerHeader.includes('name') && !lowerHeader.includes('company')) prospectField = 'prospect_name';
        else if (lowerHeader.includes('email')) prospectField = 'prospect_email';
        else if (lowerHeader.includes('title') || lowerHeader.includes('position')) prospectField = 'prospect_title';
        else if (lowerHeader.includes('linkedin')) prospectField = 'prospect_linkedin_url';
        else if (lowerHeader.includes('company') && lowerHeader.includes('name')) prospectField = 'company_name';
        else if (lowerHeader.includes('company') && lowerHeader.includes('size')) prospectField = 'company_size';
        else if (lowerHeader.includes('industry')) prospectField = 'company_industry';
        else if (lowerHeader.includes('website')) prospectField = 'company_website';
        else if (lowerHeader.includes('location') || lowerHeader.includes('city')) prospectField = 'company_location';

        return { csvColumn: header, prospectField };
      });
      setFieldMappings(initialMappings);

      // Parse data rows
      const rows: CSVRow[] = [];
      for (let i = 1; i < lines.length && i < 101; i++) { // Limit preview to 100 rows
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
      setCsvData(rows);
      setStep('map');
    };

    reader.onerror = () => {
      setError('Error reading CSV file');
    };

    reader.readAsText(file);
  };

  const handleMappingChange = (csvColumn: string, prospectField: string) => {
    setFieldMappings(prev =>
      prev.map(m => m.csvColumn === csvColumn ? { ...m, prospectField } : m)
    );
  };

  const handlePreview = () => {
    const hasEmail = fieldMappings.some(m => m.prospectField === 'prospect_email');
    if (!hasEmail) {
      setError('You must map at least the "Prospect Email" field');
      return;
    }

    if (!selectedCampaign) {
      setError('Please select a campaign');
      return;
    }

    setError('');
    setStep('preview');
  };

  const handleImport = async () => {
    setImporting(true);
    setStep('importing');
    setImportProgress({ current: 0, total: csvData.length });
    setImportResults({ success: 0, errors: 0 });

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError('Not authenticated');
      setImporting(false);
      return;
    }

    // Get customer_id
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('customer_id')
      .eq('user_id', userData.user.id)
      .single();

    if (!profile?.customer_id) {
      setError('No customer profile found');
      setImporting(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Import in batches
    const batchSize = 10;
    for (let i = 0; i < csvData.length; i += batchSize) {
      const batch = csvData.slice(i, i + batchSize);

      const prospects = batch.map(row => {
        const prospect: any = {
          user_id: userData.user.id,
          customer_id: profile.customer_id,
          campaign_id: selectedCampaign || null,
          review_status: 'pending_review',
        };

        // Map CSV data to prospect fields
        fieldMappings.forEach(mapping => {
          if (mapping.prospectField && row[mapping.csvColumn]) {
            const value = row[mapping.csvColumn];

            // Special handling for company_size (must be integer)
            if (mapping.prospectField === 'company_size') {
              const parsed = parseInt(value.replace(/[^0-9]/g, ''));
              if (!isNaN(parsed)) {
                prospect[mapping.prospectField] = parsed;
              }
            } else {
              prospect[mapping.prospectField] = value;
            }
          }
        });

        return prospect;
      });

      try {
        const { error } = await supabase
          .from('outbound_prospects')
          .insert(prospects);

        if (error) {
          console.error('Batch import error:', error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      } catch (err) {
        console.error('Batch import exception:', err);
        errorCount += batch.length;
      }

      setImportProgress({ current: i + batch.length, total: csvData.length });
      setImportResults({ success: successCount, errors: errorCount });
    }

    setImporting(false);
  };

  const resetUpload = () => {
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setStep('upload');
    setError('');
    setImportResults({ success: 0, errors: 0 });
    setImportProgress({ current: 0, total: 0 });
  };

  const downloadTemplate = () => {
    const template = 'Prospect Name,Prospect Email,Prospect Title,Prospect LinkedIn URL,Company Name,Company Size,Company Industry,Company Website,Company Location\n' +
      'John Doe,john@example.com,VP of Sales,https://linkedin.com/in/johndoe,Acme Corp,500,Technology,https://acme.com,San Francisco CA\n';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospect_upload_template.csv';
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Prospects</h1>
        <p className="text-slate-600">
          Import prospects from CSV files (LinkedIn Sales Navigator, Apollo.io, or custom exports)
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-blue-100' : 'bg-green-100'}`}>
              {step === 'upload' ? '1' : <CheckCircle className="w-5 h-5" />}
            </div>
            <span className="font-semibold">Upload CSV</span>
          </div>
          <ArrowRight className="text-slate-300" />
          <div className={`flex items-center gap-2 ${step === 'map' ? 'text-blue-600' : step === 'upload' ? 'text-slate-400' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'map' ? 'bg-blue-100' : step === 'upload' ? 'bg-slate-100' : 'bg-green-100'}`}>
              {step === 'upload' ? '2' : step === 'map' ? '2' : <CheckCircle className="w-5 h-5" />}
            </div>
            <span className="font-semibold">Map Fields</span>
          </div>
          <ArrowRight className="text-slate-300" />
          <div className={`flex items-center gap-2 ${['preview', 'importing'].includes(step) ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['preview', 'importing'].includes(step) ? 'bg-blue-100' : 'bg-slate-100'}`}>
              3
            </div>
            <span className="font-semibold">Import</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 font-semibold"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50'
            }`}
          >
            <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-700 mb-2">
              Drag & drop your CSV file here
            </p>
            <p className="text-slate-500 mb-4">or</p>
            <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-semibold transition">
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            {file && (
              <div className="mt-6 flex items-center justify-center gap-2 text-green-600">
                <FileText className="w-5 h-5" />
                <span className="font-semibold">{file.name}</span>
                <span className="text-sm">({csvData.length} rows)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Map Fields */}
      {step === 'map' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Select Campaign</h3>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Campaign (upload as unassigned)</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.campaign_name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Map CSV Columns to Prospect Fields</h3>
            <div className="space-y-3">
              {fieldMappings.map((mapping, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-center">
                  <div className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-slate-700">
                    {mapping.csvColumn}
                  </div>
                  <select
                    value={mapping.prospectField}
                    onChange={(e) => handleMappingChange(mapping.csvColumn, e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PROSPECT_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetUpload}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
            >
              Start Over
            </button>
            <button
              onClick={handlePreview}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Preview & Import
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Import */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Preview ({csvData.length} prospects)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {fieldMappings
                      .filter(m => m.prospectField)
                      .map((mapping, index) => (
                        <th key={index} className="px-4 py-2 text-left font-semibold text-slate-700">
                          {PROSPECT_FIELDS.find(f => f.value === mapping.prospectField)?.label}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-slate-200">
                      {fieldMappings
                        .filter(m => m.prospectField)
                        .map((mapping, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 text-slate-700">
                            {row[mapping.csvColumn] || '-'}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvData.length > 5 && (
              <p className="mt-4 text-sm text-slate-500 text-center">
                Showing 5 of {csvData.length} rows
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('map')}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              Import {csvData.length} Prospects
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === 'importing' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {importing ? 'Importing Prospects...' : 'Import Complete!'}
            </h3>

            {importing && (
              <div className="mb-6">
                <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{
                      width: `${(importProgress.current / importProgress.total) * 100}%`
                    }}
                  />
                </div>
                <p className="text-slate-600">
                  {importProgress.current} of {importProgress.total} prospects
                </p>
              </div>
            )}

            {!importing && (
              <div className="space-y-4">
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                    <p className="text-sm text-slate-600">Imported</p>
                  </div>
                  {importResults.errors > 0 && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-red-600">{importResults.errors}</p>
                      <p className="text-sm text-slate-600">Errors</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={resetUpload}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Upload Another File
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
