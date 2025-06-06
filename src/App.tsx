import {
  Briefcase,
  Copy,
  History,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { FiLinkedin } from "react-icons/fi";
import { CiTwitter } from "react-icons/ci";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Checkbox } from "./components/ui/checkbox";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import toast from "react-hot-toast";
import type {
  FormData,
  GeneratedMessage,
  Platform,
  SavedMessage,
} from "./type";
import { GenerateDM } from "./lib/GenerateDM";

const initialFormData: FormData = {
  yourName: "",
  yourRole: "",
  targetName: "",
  targetRole: "",
  companyName: "",
  jobTitle: "",
  personalNote: "",
  reason: "job_application",
  tone: "professional",
  mentionResume: false,
  resumeLink: "",
  platform: "linkedin",
  jobType: "internship",
};

const reasonOptions = [
  { value: "job_application", label: "Applying for a specific role" },
  { value: "internship_inquiry", label: "Seeking internship opportunities" },
  { value: "referral_request", label: "Asking for employee referral" },
  { value: "informational", label: "Learning about company/role" },
  { value: "follow_up", label: "Following up on application" },
];

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "humble", label: "Humble" },
];

const jobTypeOptions = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
];

const App = () => {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<
    GeneratedMessage
  >();
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("jobSeekerDmHistory");
    if (saved) {
      setSavedMessages(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      console.log(formData);
      const messages = await GenerateDM({ formData });
      setGeneratedMessages(messages);
      console.log(messages);
      // Save to history
      const newSavedMessage: SavedMessage = {
        id: Date.now().toString(),
        platform,
        formData: { ...formData },
        messages,
        timestamp: Date.now(),
      };
      const updatedHistory = [newSavedMessage, ...savedMessages].slice(0, 10); // Keep only last 10
      setSavedMessages(updatedHistory);
      localStorage.setItem(
        "jobSeekerDmHistory",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      toast.error("Failed to generate messages. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard");
  };

  const regenerateMessages = async () => {
    setIsGenerating(true);
    try {
      const messages = await GenerateDM({ formData });
      setGeneratedMessages(messages);
      console.log(messages);
    } catch (error) {
      toast.error("Failed to regenerate messages. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSavedMessage = (saved: SavedMessage) => {
    setPlatform(saved.platform);
    setFormData(saved.formData);
    setGeneratedMessages(saved.messages);
    setShowHistory(false);
  };

  const deleteSavedMessage = (id: string) => {
    const updatedHistory = savedMessages.filter((msg) => msg.id !== id);
    setSavedMessages(updatedHistory);
    localStorage.setItem("jobSeekerDmHistory", JSON.stringify(updatedHistory));
  };

  const clearForm = () => {
    setFormData(initialFormData);
    setGeneratedMessages(undefined);
  };

  return (
    <main className='min-h-screen bg-black dark:from-black'>
      <div className='container mx-auto px-4 py-4 max-w-7xl'>
        <header className='flex flex-col items-center mb-4 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2'>
            AI Cold DM Generator
          </h1>
          <p className='text-muted-foreground text-lg max-w-2xl'>
            Create personalized outreach messages for job applications
          </p>
        </header>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Left Column - Form */}
          <div className='w-full lg:w-1/2'>
            <Card className='shadow-md bg-black border-white/50'>
              <CardHeader>
                <CardTitle>Message Details</CardTitle>
                <CardDescription>
                  Fill in the details to generate your personalized message
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className='mb-6'>
                  <Tabs
                    value={platform}
                    onValueChange={(value) => setPlatform(value as Platform)}
                  >
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger
                        value='linkedin'
                        className='flex items-center gap-2'
                      >
                        <FiLinkedin className='h-4 w-4' />
                        LinkedIn
                      </TabsTrigger>
                      <TabsTrigger
                        value='twitter'
                        className='flex items-center gap-2'
                      >
                        <CiTwitter className='h-4 w-4' />
                        Twitter
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='yourName'>Your Name</Label>
                      <Input
                        id='yourName'
                        name='yourName'
                        placeholder='John Doe'
                        required
                        value={formData.yourName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='yourRole'>Your Role</Label>
                      <Input
                        id='yourRole'
                        name='yourRole'
                        placeholder='Software Engineer'
                        required
                        value={formData.yourRole}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='targetName'>Target's Name</Label>
                      <Input
                        id='targetName'
                        name='targetName'
                        placeholder='Jane Smith'
                        required
                        value={formData.targetName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='targetRole'>Target's Role</Label>
                      <Input
                        id='targetRole'
                        name='targetRole'
                        placeholder='Product Manager'
                        required
                        value={formData.targetRole}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='companyName'>Company Name</Label>
                      <Input
                        id='companyName'
                        name='companyName'
                        placeholder='Acme Inc.'
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='jobTitle'>Job Title Applied For</Label>
                      <Input
                        id='jobTitle'
                        name='jobTitle'
                        placeholder='Software Engineer'
                        required
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='personalNote'>
                      Personal Note (Optional)
                      <span className='text-muted-foreground text-xs ml-1'>
                        (e.g., "loved your post on engineering culture")
                      </span>
                    </Label>
                    <Textarea
                      id='personalNote'
                      name='personalNote'
                      placeholder='I noticed your recent post about...'
                      rows={3}
                      value={formData.personalNote}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='reason'>Reason for DM</Label>
                    <Select
                      value={formData.reason}
                      onValueChange={(value) =>
                        handleSelectChange("reason", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a reason' />
                      </SelectTrigger>
                      <SelectContent>
                        {reasonOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='reason'>Tone of Message</Label>
                      <Select
                        value={formData.tone}
                        onValueChange={(value) =>
                          handleSelectChange("tone", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a Tone' />
                        </SelectTrigger>
                        <SelectContent>
                          {toneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='reason'>Job Type</Label>
                      <Select
                        value={formData.jobType}
                        onValueChange={(value) =>
                          handleSelectChange("jobtype", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a Job Type' />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='mentionResume'
                        checked={formData.mentionResume}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            mentionResume: checked === true,
                          }))
                        }
                      />
                      <Label
                        htmlFor='mentionResume'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Mention that you've attached your resume
                      </Label>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Include a line about your attached resume in the message
                    </p>
                  </div>

                  {formData.mentionResume && (
                    <div className='space-y-2'>
                      <Label htmlFor='resumeLink'>Resume Link</Label>
                      <Input
                        id='resumeLink'
                        name='resumeLink'
                        placeholder='https://example.com/resume.pdf'
                        required
                        value={formData.resumeLink}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  <div className='flex gap-2 pt-2 '>
                    <Button
                      type='submit'
                      className='flex-1 bg-blue-600 hover:bg-blue-700 text-md text-bold'
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <ThreeDot
                          variant='brick-stack'
                          color='#000000'
                          size='small'
                        />
                      ) : (
                        <>
                          <Send className='mr-2 h-4 w-4' />
                          Generate DM
                        </>
                      )}
                    </Button>
                    <Button type='button' variant='outline' onClick={clearForm}>
                      Clear
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <History className='h-4 w-4' />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            {/* History Panel */}
            {showHistory && (
              <Card className='mt-4 shadow-md'>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-medium'>Message History</h3>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowHistory(false)}
                    >
                      Close
                    </Button>
                  </div>
                  {savedMessages.length === 0 ? (
                    <p className='text-muted-foreground'>
                      No saved messages yet
                    </p>
                  ) : (
                    <div className='space-y-3 max-h-[300px] overflow-y-auto'>
                      {savedMessages.map((saved) => (
                        <div
                          key={saved.id}
                          className='p-3 border rounded-md hover:bg-muted/50 flex justify-between'
                        >
                          <div
                            className='cursor-pointer'
                            onClick={() => loadSavedMessage(saved)}
                          >
                            <div className='flex items-center gap-2'>
                              {saved.platform === "linkedin" ? (
                                <FiLinkedin className='h-4 w-4' />
                              ) : (
                                <CiTwitter className='h-4 w-4' />
                              )}
                              <span className='font-medium'>
                                {saved.formData.targetName} (
                                {saved.formData.companyName})
                              </span>
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {new Date(saved.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => deleteSavedMessage(saved.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Results */}
          <div className='w-full lg:w-1/2'>
            {isGenerating ? (
              <Card className='shadow-md h-full flex items-center justify-center min-h-[400px] bg-black border-white/50'>
                <div className='text-center p-8'>
                  <div className='mb-4'>
                    <ThreeDot
                      variant='brick-stack'
                      color='#000000'
                      size='small'
                    />
                  </div>
                  <p className='text-muted-foreground'>
                    Crafting your personalized message...
                  </p>
                </div>
              </Card>
            ) : generatedMessages ? (
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl font-semibold'>Generated Messages</h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={regenerateMessages}
                  >
                    <RefreshCw className='mr-2 h-4 w-4' /> Regenerate
                  </Button>
                </div>

                <Tabs defaultValue='standard'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='standard'>Standard</TabsTrigger>
                    <TabsTrigger value='concise'>Concise</TabsTrigger>
                    <TabsTrigger value='enthusiastic'>Enthusiastic</TabsTrigger>
                  </TabsList>

                  {["standard", "concise", "enthusiastic"].map((variant) => (
                    <TabsContent key={variant} value={variant}>
                      <Card className='shadow-md bg-black border-white/50'>
                        <CardContent>
                          <div className='flex justify-between items-start'>
                            <div className='flex items-center'>
                              {platform === "linkedin" ? (
                                <FiLinkedin className='h-5 w-5 mr-2' />
                              ) : (
                                <CiTwitter className='h-5 w-5 mr-2' />
                              )}
                              <span className='font-medium capitalize'>
                                {variant} Tone
                              </span>
                            </div>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() =>
                                copyToClipboard(
                                  generatedMessages[platform][variant]
                                )
                              }
                            >
                              <Copy className='h-4 w-4' />
                            </Button>
                          </div>
                          <div className='whitespace-pre-wrap'>
                            {generatedMessages[platform][variant]}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <Card className='shadow-md h-full flex items-center justify-center min-h-[400px]'>
                <div className='text-center p-8 max-w-md'>
                  <div className='mx-auto rounded-full bg-blue-100 dark:bg-blue-900 w-16 h-16 flex items-center justify-center mb-4'>
                    <Briefcase className='h-8 w-8 text-blue-600 dark:text-blue-300' />
                  </div>
                  <h3 className='text-xl font-medium mb-2'>
                    Ready to Create Your Message
                  </h3>
                  <p className='text-muted-foreground mb-6'>
                    Fill out the form and click "Generate DM" to create a
                    personalized outreach message for your job application.
                  </p>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-3 text-left'>
                      <div className='bg-blue-100 dark:bg-blue-900 p-2 rounded-full'>
                        <FiLinkedin className='h-4 w-4 text-blue-600 dark:text-blue-300' />
                      </div>
                      <div>
                        <p className='font-medium'>LinkedIn Example</p>
                        <p className='text-sm text-muted-foreground'>
                          "Hi [Name], I recently applied for the [Position] role
                          at [Company]. I'd love to learn more about the team
                          and culture. Would you be open to a quick chat?"
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 text-left'>
                      <div className='bg-blue-100 dark:bg-blue-900 p-2 rounded-full'>
                        <CiTwitter className='h-4 w-4 text-blue-600 dark:text-blue-300' />
                      </div>
                      <div>
                        <p className='font-medium'>Twitter Example</p>
                        <p className='text-sm text-muted-foreground'>
                          "Hi [Name]! I just applied for [Position] at
                          [Company]. Really excited about the opportunity. Any
                          chance you could share insights about the role?"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
