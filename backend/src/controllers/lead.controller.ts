import { Request, Response } from "express";
import csv from "csv-parser";
import { Readable } from "stream";

import Lead from "../models/Lead.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const createLead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create lead",
    });
  }
};

export const importLeads = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      });
      return;
    }

    const rows: any[] = [];

    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", async () => {
        let imported = 0;
        let duplicates = 0;
        let failed = 0;

        const leadsToInsert: any[] = [];

        for (const row of rows) {
          const name = row.name?.trim();
          const email = row.email?.trim();
          const status = row.status?.trim();
          const source = row.source?.trim();

          // Required fields
          if (!name || !email || !status || !source) {
            failed++;
            continue;
          }

          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!emailRegex.test(email)) {
            failed++;
            continue;
          }

          // Duplicate email
          const exists = await Lead.findOne({ email });

          if (exists) {
            duplicates++;
            continue;
          }

          leadsToInsert.push({
            name,
            email,
            status,
            source,
          });
        }

        if (leadsToInsert.length > 0) {
          await Lead.insertMany(leadsToInsert);

          imported = leadsToInsert.length;
        }

        res.status(200).json({
          success: true,
          message: "CSV imported successfully",

          summary: {
            totalRows: rows.length,
            imported,
            duplicates,
            failed,
          },
        });
      });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to import CSV",
    });
  }
};

export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, source, search, sort = "latest", page = "1" } = req.query;

    const query: Record<string, unknown> = {};

    /*
      STATUS FILTER
    */
    if (status) {
      query.status = status;
    }

    /*
      SOURCE FILTER
    */
    if (source) {
      query.source = source;
    }

    /*
      SEARCH FILTER
      Search by:
      - name
      - email
    */
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /*
      SORTING
    */
    let sortOption = {};

    if (sort === "latest") {
      sortOption = { createdAt: -1 };
    }

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    /*
      PAGINATION
    */
    const pageNumber = parseInt(page as string) || 1;

    const limit = 10;

    const skip = (pageNumber - 1) * limit;

    /*
      TOTAL RECORDS
    */
    const totalRecords = await Lead.countDocuments(query);

    /*
      FETCH DATA
    */
    const leads = await Lead.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    /*
      TOTAL PAGES
    */
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      success: true,

      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalRecords,
      },

      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};

export const getLeadById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  },
);

export const updateLead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      res.status(404).json({
        success: false,
        message: "Lead not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update lead",
    });
  }
};

export const deleteLead = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  },
);
