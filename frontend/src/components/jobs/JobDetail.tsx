/** @format */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiInstance from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function JobDetail({ job }) {
  if (!job) return <p className="p-4">Loading job details...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <p className="text-muted-foreground">{job.company}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Location:</strong> {job.jobAddress}
          </div>

          <div>
            <strong>Job Type:</strong>{' '}
            {job.jobTypes.map((type: string, idx: number) => (
              <Badge key={idx} className="mr-2">
                {type}
              </Badge>
            ))}
          </div>

          <div>
            <strong>Salary:</strong>{' '}
            {job.salary.min > 0 || job.salary.max > 0
              ? `${job.salary.min} - ${
                  job.salary.max
                } per ${job.salary.period.toLowerCase()}`
              : 'Not disclosed'}
          </div>

          <div className="prose">
            <strong>Description:</strong>
            <div
              className="whitespace-pre-line mt-2"
              dangerouslySetInnerHTML={{
                __html: job.description.replace(/\n/g, '<br />'),
              }}
            />
          </div>

          {job.applyMethod?.method === 'URL' && job.applyMethod.url && (
            <div>
              <Button asChild>
                <a
                  href={job.applyMethod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Now
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
