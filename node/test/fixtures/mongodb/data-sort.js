/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

module.exports = {
  lessons: [
    {
      _id: ObjectId('5f0cfea3395d762ca65405c1'),
      lessonId: 'lesson-1',
      name: '123',
      createdBy: '123',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c2'),
      lessonId: 'lesson-2',
      name: 'aaa',
      createdBy: 'aaa',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c3'),
      lessonId: 'lesson-3',
      name: 'AAA',
      createdBy: 'AAA',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c4'),
      lessonId: 'lesson-4',
      name: 'bbb',
      createdBy: 'bbb',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c5'),
      lessonId: 'lesson-5',
      name: 'BBB',
      createdBy: 'BBB',
    },
  ],
};
