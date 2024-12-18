const ProjectProvider =require( '../models/project-providerModel');
const mongoose =require( 'mongoose');

class ProjectProviderControl {
  static validateId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid project ID format');
    }
  };

  static handleError(res, error, defaultMessage = 'An error occurred') {
    console.error(error);
    return res.status(500).json({
      message: defaultMessage,
      error: error.message,
    });
  }

  static applyToProject = async (req, res) => {
    try {
      const { project_id, username } = req.body;
      this.validateId(project_id);
      if (!project_id || !username) {
        return res.status(400).json({
          message: 'Both project ID and username are required.',
        });
      }
      const userID = req.user?.id;
      if (!userID) {
        return res.status(401).json({
          message: 'Unauthorized: User ID is missing.',
        });
      }
      const existingProjectProvider = await ProjectProvider.findOne({
        project_id,
        userID  // Use the authenticated user's ID
      });
      if (existingProjectProvider) {
        return res.status(409).json({
          message: 'You have already applied to this project'
        });
      }
      const applied = new ProjectProvider({
        project_id,
        username,
        userID
      });
      const appliedProject = await applied.save();
      res.status(201).json({
        message: 'You have successfully applied to the project.',
        appliedProject,
      });
    } catch (error) {
      if (error.message === 'Invalid project ID format') {
        return res.status(400).json({
          message: 'Invalid project ID format'
        });
      }
      this.handleError(res, error, 'Error while applying to the project');
    }
  };
  static getProjectByUsername = async (req, res) => {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ message: "Username is required", projects: [] });
      }
      
      // Populate the project details when finding project providers
      const projects = await ProjectProvider.find({ username })
        .populate({
          path: 'project_id', // Assuming this is the field storing the project reference
          model: 'Project' // Make sure this matches your Project model name
        });
  
      return res.status(200).json({
        message: `Projects of ${username}`,
        projects: projects
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: `Error while fetching projects for ${username}`,
        projects: []
      });
    }
  };
  static getProjectProviders = async (req, res) => {
    try {
      const { projectId } = req.params;
      
      // Validate the project ID
      this.validateId(projectId);
  
      // Find all project providers for this project
      const providers = await ProjectProvider.find({ project_id: projectId })
        .select('username')
        .lean();
  
      return res.status(200).json({
        message: 'Project providers retrieved successfully',
        providers
      });
    } catch (error) {
      return this.handleError(
        res, 
        error, 
        'Error retrieving project providers'
      );
    }
  };
}

module.exports=ProjectProviderControl;