import mongoose from 'mongoose';
import Activity, { IActivity } from '../models/Activity';
import Project from '../models/Project';
import Language from '../models/Language';
import DailySummary from '../models/DailySummary';
import { startOfDay, endOfDay } from 'date-fns';

interface ActivityCreateData {
  userId: string;
  projectName?: string;
  languageName?: string;
  editor: string;
  platform: string;
  filePath?: string;
  lineCount?: number;
  cursorPosition?: number;
  durationSeconds: number;
  startedAt: Date;
  endedAt: Date;
}

export const ActivityService = {
  async recordActivity(data: ActivityCreateData): Promise<IActivity> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const activityData: any = {
        user: data.userId,
        editor: data.editor,
        platform: data.platform,
        filePath: data.filePath,
        lineCount: data.lineCount,
        cursorPosition: data.cursorPosition,
        durationSeconds: data.durationSeconds,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
      };

      // Handle project
      if (data.projectName) {
        let project = await Project.findOne({ 
          name: data.projectName, 
          user: data.userId 
        }).session(session);

        if (!project) {
          project = await Project.create([{
            name: data.projectName,
            user: data.userId
          }], { session });
          project = project[0];
        }

        activityData.project = project._id;
      }

      // Handle language
      if (data.languageName) {
        let language = await Language.findOne({ 
          name: data.languageName 
        }).session(session);

        if (!language) {
          language = await Language.create([{
            name: data.languageName
          }], { session });
          language = language[0];
        }

        activityData.language = language._id;
      }

      // Create activity
      const activity = await Activity.create([activityData], { session });

      // Update daily summary
      const dateStr = data.startedAt.toISOString().split('T')[0];
      const date = new Date(dateStr);
      
      let dailySummary = await DailySummary.findOne({
        user: data.userId,
        date: {
          $gte: new Date(date),
          $lt: new Date(new Date(date).setDate(date.getDate() + 1))
        }
      }).session(session);

      if (!dailySummary) {
        dailySummary = await DailySummary.create([{
          user: data.userId,
          date,
          totalSeconds: data.durationSeconds,
          languages: data.languageName && activityData.language ? [{
            language: activityData.language,
            seconds: data.durationSeconds
          }] : [],
          projects: data.projectName && activityData.project ? [{
            project: activityData.project,
            seconds: data.durationSeconds
          }] : []
        }], { session });
        dailySummary = dailySummary[0];
      } else {
        // Update total seconds
        dailySummary.totalSeconds += data.durationSeconds;

        // Update language stats
        if (data.languageName && activityData.language) {
          const langIndex = dailySummary.languages.findIndex(
            l => l.language.toString() === activityData.language.toString()
          );

          if (langIndex >= 0) {
            dailySummary.languages[langIndex].seconds += data.durationSeconds;
          } else {
            dailySummary.languages.push({
              language: activityData.language,
              seconds: data.durationSeconds
            });
          }
        }

        // Update project stats
        if (data.projectName && activityData.project) {
          const projIndex = dailySummary.projects.findIndex(
            p => p.project.toString() === activityData.project.toString()
          );

          if (projIndex >= 0) {
            dailySummary.projects[projIndex].seconds += data.durationSeconds;
          } else {
            dailySummary.projects.push({
              project: activityData.project,
              seconds: data.durationSeconds
            });
          }
        }

        await dailySummary.save({ session });
      }

      await session.commitTransaction();
      return activity[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getUserActivities(userId: string, limit = 100, offset = 0): Promise<IActivity[]> {
    return Activity.find({ user: userId })
      .sort({ startedAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('project', 'name')
      .populate('language', 'name');
  },

  static async getDailyStats(userId: string, date: Date) {
    const start = startOfDay(date);
    const end = endOfDay(date);

    const stats = await Activity.aggregate([
      {
        $match: {
          user: userId,
          startedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalSeconds: { $sum: '$durationSeconds' },
          projects: { 
            $addToSet: '$projectName'
          },
          languages: {
            $addToSet: '$languageName'
          }
        }
      }
    ]);

    return stats[0] || { totalSeconds: 0, projects: [], languages: [] };
  },

  static async getLanguageStats(userId: string, startDate: Date, endDate: Date) {
    return Activity.aggregate([
      {
        $match: {
          user: userId,
          startedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$languageName',
          totalSeconds: { $sum: '$durationSeconds' }
        }
      },
      {
        $sort: { totalSeconds: -1 }
      }
    ]);
  }
};