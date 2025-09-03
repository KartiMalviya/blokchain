import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  School as SchoolIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
// ✅ Fixed import path
import ipfsService from '../utils/ipfsService';

import { format } from 'date-fns';

const IssueCredentials = () => {
  const { account, isAuthorized, universityName, issueCredential } = useWallet();
  
  const [formData, setFormData] = useState({
    studentId: '',
    degree: '',
    courseName: '',
    graduationDate: '',
    ipfsHash: '',
  });
  
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [issuedCredentialHash, setIssuedCredentialHash] = useState(null);

  const degrees = [
    'Bachelor of Science',
    'Bachelor of Arts',
    'Bachelor of Engineering',
    'Master of Science',
    'Master of Arts',
    'Master of Business Administration',
    'Doctor of Philosophy',
    'Associate Degree',
    'Certificate',
  ];

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        const hashes = await ipfsService.uploadMultipleFiles(selectedFiles);
        setFormData({
          ...formData,
          ipfsHash: hashes[0], // Use first file hash or create directory structure
        });
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!isAuthorized) {
      return;
    }

    setIsIssuing(true);
    try {
      const graduationTimestamp = Math.floor(new Date(formData.graduationDate).getTime() / 1000);
      
      const credentialHash = await issueCredential(
        formData.studentId,
        formData.degree,
        formData.courseName,
        graduationTimestamp,
        formData.ipfsHash
      );

      if (credentialHash) {
        setIssuedCredentialHash(credentialHash);
        setActiveStep(3);
      }
    } catch (error) {
      console.error('Error issuing credential:', error);
    } finally {
      setIsIssuing(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.studentId.trim() !== '' &&
      formData.degree !== '' &&
      formData.courseName.trim() !== '' &&
      formData.graduationDate !== ''
    );
  };

  const steps = [
    {
      label: 'Student Information',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Student ID"
              value={formData.studentId}
              onChange={handleInputChange('studentId')}
              required
              helperText="Unique student identifier"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Degree</InputLabel>
              <Select
                value={formData.degree}
                label="Degree"
                onChange={handleInputChange('degree')}
              >
                {degrees.map((degree) => (
                  <MenuItem key={degree} value={degree}>
                    {degree}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Course/Major Name"
              value={formData.courseName}
              onChange={handleInputChange('courseName')}
              required
              helperText="e.g., Computer Science, Business Administration"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Graduation Date"
              type="date"
              value={formData.graduationDate}
              onChange={handleInputChange('graduationDate')}
              required
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: new Date().toISOString().split('T')[0],
              }}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: 'Additional Documents (Optional)',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload additional documents like transcripts, certificates, or other supporting materials to IPFS.
          </Typography>
          <input
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={isUploading}
              sx={{ mb: 2 }}
            >
              {isUploading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          </label>
          
          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Uploaded Files:
              </Typography>
              {files.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}
          
          {formData.ipfsHash && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Documents uploaded to IPFS successfully!
              <br />
              Hash: {formData.ipfsHash}
            </Alert>
          )}
        </Box>
      ),
    },
    {
      label: 'Review & Issue',
      content: (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Credential Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Student ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formData.studentId}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Degree
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formData.degree}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Course/Major
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formData.courseName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Graduation Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formData.graduationDate ? format(new Date(formData.graduationDate), 'PPP') : ''}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Issuing University
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {universityName}
                </Typography>
              </Grid>
              {formData.ipfsHash && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    IPFS Hash
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {formData.ipfsHash}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={!isFormValid() || isIssuing}
            startIcon={isIssuing ? <CircularProgress size={20} /> : <SchoolIcon />}
          >
            {isIssuing ? 'Issuing Credential...' : 'Issue Credential'}
          </Button>
        </Box>
      ),
    },
    {
      label: 'Success',
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ color: 'success.main' }}>
            Credential Issued Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The academic credential has been issued and stored on the blockchain.
          </Typography>
          
          {issuedCredentialHash && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Credential Hash:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {issuedCredentialHash}
              </Typography>
            </Paper>
          )}
          
          <Button
            variant="outlined"
            onClick={() => {
              setFormData({
                studentId: '',
                degree: '',
                courseName: '',
                graduationDate: '',
                ipfsHash: '',
              });
              setFiles([]);
              setIssuedCredentialHash(null);
              setActiveStep(0);
            }}
          >
            Issue Another Credential
          </Button>
        </Box>
      ),
    },
  ];

  if (!account) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
          Please connect your wallet to issue credentials.
        </Alert>
      </Box>
    );
  }

  if (!isAuthorized) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto' }}>
          Your wallet is not authorized to issue credentials. Please contact the system administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Issue Academic Credentials
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {universityName}
                </Typography>
              </Box>
              
              <form onSubmit={handleSubmit}>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel>{step.label}</StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          {step.content}
                        </Box>
                        {index < steps.length - 1 && activeStep < 3 && (
                          <Box sx={{ mb: 2 }}>
                            <Button
                              variant="contained"
                              onClick={() => setActiveStep((prev) => prev + 1)}
                              disabled={!isFormValid()}
                              sx={{ mr: 1 }}
                            >
                              Continue
                            </Button>
                            <Button
                              disabled={index === 0}
                              onClick={() => setActiveStep((prev) => prev - 1)}
                            >
                              Back
                            </Button>
                          </Box>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </form>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Instructions
            </Typography>
            <Typography variant="body2" paragraph>
              1. Fill in the student information including ID, degree, and graduation date.
            </Typography>
            <Typography variant="body2" paragraph>
              2. Optionally upload additional documents to IPFS for secure storage.
            </Typography>
            <Typography variant="body2" paragraph>
              3. Review the credential details before issuing.
            </Typography>
            <Typography variant="body2">
              4. Submit the transaction to issue the credential on the blockchain.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Current Step: {activeStep + 1} of {steps.length}
            </Typography>
            
            {activeStep === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please provide the student's basic information to proceed.
              </Alert>
            )}
            
            {activeStep === 1 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Upload additional documents if needed. This step is optional.
              </Alert>
            )}
            
            {activeStep === 2 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Review all information carefully before issuing the credential.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IssueCredentials;
