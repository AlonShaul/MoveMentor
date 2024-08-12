import sgMail from '@sendgrid/mail';
import schedule from 'node-schedule';
import moment from 'moment-timezone';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const generatePlanTable = (planGroups) => {
  let tableHtml = `
    <style>
      @media only screen and (max-width: 600px) {
        table {
          width: 100% !important;
          border: none !important;
        }
        th, td {
          padding: 10px !important;
          font-size: 14px !important;
          display: block !important;
          text-align: right !important;
          border: none !important;
        }
        th {
          background-color: #f2f2f2 !important;
        }
        td {
          border-bottom: 1px solid #ddd !important;
          margin-bottom: 5px !important;
        }
        tr {
          margin-bottom: 10px !important;
          display: block !important;
        }
        .mobile-title {
          font-weight: bold !important;
          margin-top: 10px !important;
        }
        .mobile-item {
          margin-bottom: 5px !important;
        }
      }
    </style>
    <table border="1" style="border-collapse: collapse; width: 60%; margin: auto; text-align:center;">
      <thead>
        <tr>
          <th style="padding: 3px;">כותרת</th>
          <th style="padding: 3px;">תיאור</th>
          <th style="padding: 3px;">וידאו</th>
          <th style="padding: 3px;">מותאם לגיל השלישי</th>
          <th style="padding: 3px;">מותאם לילדים</th>
          <th style="padding: 3px;">משך כולל</th>
        </tr>
      </thead>
      <tbody>
  `;

  planGroups.forEach(group => {
    group.plans.forEach(plan => {
      plan.exercises.forEach(exercise => {
        tableHtml += `
          <tr class="mobile-item">
            <td class="mobile-title" style="padding: 3px;">כותרת: ${exercise.title}</td>
            <td style="padding: 3px;"><strong>תיאור:</strong> ${exercise.explanation}</td>
            <td style="padding: 3px;"><strong>וידאו:</strong> <a href="${exercise.videoUrl}">וידאו</a></td>
            <td style="padding: 3px;"><strong>מותאם לגיל השלישי:</strong> ${exercise.adaptedForThirdAge ? 'כן' : 'לא'}</td>
            <td style="padding: 3px;"><strong>מותאם לילדים:</strong> ${exercise.adaptedForChildren ? 'כן' : 'לא'}</td>
            <td style="padding: 3px;"><strong>משך כולל:</strong> ${exercise.duration} דקות</td>
          </tr>
        `;
      });
    });
  });

  tableHtml += '</tbody></table>';
  return tableHtml;
};

export const sendWeeklyEmail = async () => {
    try {
        const users = await User.find({}).populate('planGroups.plans');
        users.forEach(user => {
            if (!user.email) {
                console.error('No email for user:', user);
                return;
            }
            if (user.planGroups.length < 1) {
                console.error('No plans for user:', user.username);
                return;
            }
            console.log('Sending email to:', user.email);

            const planTableHtml = generatePlanTable(user.planGroups);

            const msg = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'תזכורת שבועית !',
                text: 'MoveMentor מתזכרת אתכם לעשות את התוכנית השיקום האישית שיצרתם!',
                html: `
                  <div dir="rtl">
                    <strong style="display: block; text-align: right;">MoveMentor מתזכרת אתכם לעשות את התוכנית השיקום האישית שיצרתם !</strong>
                    ${planTableHtml}
                  </div>
                `,
            };
            sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent to :', user.email);
            })
            .catch((error) => {
              console.error('Error sending email:', error);
            });
        });
    } catch (error) {
        console.error('Error in sendWeeklyEmail:', error);
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserPlans = async (req, res) => {
    try {
        const userId = req.params.id;
        const plans = await Plan.find({ userId }).sort({ createdAt: -1 }).limit(1);
        res.status(200).json(plans);
    } catch (error) {
        console.error('Error fetching user plans:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserPlansByCategory = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('plansByCategory.plan');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.plansByCategory);
    } catch (error) {
        console.error('Error fetching user plans by category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const saveUserPlan = async (req, res) => {
    try {
        const { userId, planId, category } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.plansByCategory.push({ category, plan: planId });
        await user.save();

        res.status(201).json({ message: 'Plan saved to user profile successfully' });
    } catch (err) {
        console.error('Error saving user plan:', err);
        res.status(500).json({ message: err.message });
    }
};

export const getUserPlanGroups = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('planGroups.plans');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.planGroups);
    } catch (error) {
        console.error('Error fetching user plan groups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
