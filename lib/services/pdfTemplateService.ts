// lib/services/pdfTemplateService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pdfTemplateService = {
  getTemplates: async (userId: string) => {
    try {
      const templates = await prisma.pdfTemplate.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc', // Or any other ordering you prefer
        },
      });
      return templates;
    } catch (error) {
      console.error('Error fetching PDF templates:', error);
      throw error;
    }
  },

  createTemplate: async (
    manufacturer: string,
    productType: string,
    pdfUrl: string,
    userId: string
  ) => {
    try {
      const newTemplate = await prisma.pdfTemplate.create({
        data: {
          manufacturer,
          productType,
          pdfUrl,
          userId,
        },
      });
      return newTemplate;
    } catch (error) {
      console.error('Error creating PDF template:', error);
      throw error;
    }
  },

  updateTemplate: async (id: string, pdfUrl: string | null) => {
    try {
      const updatedTemplate = await prisma.pdfTemplate.update({
        where: {
          id: id,
        },
        data: {
          pdfUrl: pdfUrl,
        },
      });
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating PDF template:', error);
      throw error;
    }
  },

  getTemplateByManufacturerAndType: async (
    manufacturer: string,
    productType: string,
    userId: string
  ) => {
    try {
      const template = await prisma.pdfTemplate.findFirst({
        where: {
          manufacturer: manufacturer,
          productType: productType,
          userId: userId,
        },
      });
      return template; // This can be null if no template is found
    } catch (error) {
      console.error(
        'Error fetching PDF template by manufacturer and type:',
        error
      );
      throw error;
    }
  },
};

export default pdfTemplateService;
